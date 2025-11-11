{
  description = "j12zdotcom - Site personnel de Jérémie Alcaraz (Astro)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    let
      # Systèmes supportés
      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
    in
    flake-utils.lib.eachSystem systems (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };

        # Version de Node.js à utiliser
        nodejs = pkgs.nodejs_20;

        # Dépendances pour le build
        buildInputs = with pkgs; [
          nodejs
          pnpm_9  # Utiliser pnpm 9.x compatible avec lockfileVersion 9.0
          vips  # Pour l'optimisation d'images (utilisé par sharp)
        ];

        # Configuration de pnpm
        pnpmDeps = pkgs.stdenvNoCC.mkDerivation {
            pname = "j12zdotcom-pnpm-deps";
            version = "1.0.0";
            src = ./.;
            nativeBuildInputs = [ nodejs pkgs.pnpm_9 pkgs.cacert ];

            # Fixed-output derivation pour permettre l'accès réseau
            outputHashMode = "recursive";
            outputHashAlgo = "sha256";
            outputHash = pkgs.lib.fakeHash;

            buildPhase = ''
              export HOME=$TMPDIR
              export STORE_PATH=$TMPDIR/pnpm-store

              # Augmenter la limite de mémoire Node.js à 1.5 GB
              export NODE_OPTIONS="--max-old-space-size=1536"

              # Configurer pnpm pour utiliser moins de mémoire
              pnpm config set store-dir $STORE_PATH
              pnpm config set network-concurrency 1
              pnpm config set child-concurrency 1
              pnpm config set fetch-retries 5
              pnpm config set fetch-timeout 180000

              # Utiliser shamefully-hoist pour réduire l'utilisation mémoire
              pnpm config set shamefully-hoist true
              pnpm config set strict-peer-dependencies false

              # Installation en une seule étape optimisée
              echo "Installing dependencies with memory-optimized settings..."
              pnpm install --frozen-lockfile --no-optional --ignore-scripts --prefer-offline \
                || pnpm install --no-frozen-lockfile --no-optional --ignore-scripts --prefer-offline
            '';

            installPhase = ''
              mkdir -p $out
              cp -r node_modules $out/
            '';
        };

        # Build du site Astro
        site = pkgs.stdenv.mkDerivation {
          pname = "j12zdotcom";
          version = "1.0.0";
          src = ./.;

          nativeBuildInputs = buildInputs;

          # Variables d'environnement pour le build
          NODE_ENV = "production";
          SHARP_IGNORE_GLOBAL_LIBVIPS = "1";

          buildPhase = ''
            export HOME=$TMPDIR

            # Copier les node_modules depuis pnpmDeps
            cp -r ${pnpmDeps}/node_modules .
            chmod -R +w node_modules

            # Créer les dossiers nécessaires pour les images
            mkdir -p src/assets/img_opt src/assets/img_raw

            # Build du site (sans optimisation d'images pour éviter les erreurs)
            pnpm build || pnpm exec astro build
          '';

          installPhase = ''
            mkdir -p $out

            # Copier le site buildé
            if [ -d "dist" ]; then
              cp -r dist/* $out/
            else
              echo "Error: dist directory not found"
              exit 1
            fi
          '';

          meta = with pkgs.lib; {
            description = "Site vitrine moderne pour présenter formations et services";
            homepage = "https://jeremiealcaraz.com";
            license = licenses.mit;
            platforms = platforms.linux ++ platforms.darwin;
          };
        };

      in
      {
        # Package exporté (le site buildé)
        packages = {
          default = site;
          site = site;
        };

        # Shell de développement
        devShells.default = pkgs.mkShell {
          buildInputs = buildInputs ++ (with pkgs; [
            git
            docker
            docker-compose
          ]);

          shellHook = ''
            echo "🚀 Environnement de développement j12zdotcom"
            echo "Node.js: $(node --version)"
            echo "pnpm: $(pnpm --version)"
            echo ""
            echo "Commandes disponibles:"
            echo "  pnpm dev      - Lancer le serveur de développement"
            echo "  pnpm build    - Builder le site"
            echo "  pnpm preview  - Preview du build"
            echo ""
          '';
        };

        # Apps pour faciliter l'utilisation
        apps = {
          dev = {
            type = "app";
            program = "${pkgs.writeShellScript "dev" ''
              ${nodejs}/bin/pnpm dev
            ''}";
          };
          build = {
            type = "app";
            program = "${pkgs.writeShellScript "build" ''
              ${nodejs}/bin/pnpm build
            ''}";
          };
        };
      }
    ) // {
      # Module NixOS pour déployer le site
      nixosModules = {
        default = self.nixosModules.j12z-webserver;

        j12z-webserver = { config, lib, pkgs, ... }:
          with lib;
          let
            cfg = config.services.j12z-webserver;
            system = pkgs.stdenv.hostPlatform.system;
            siteBuild = self.packages.${system}.site;
          in
          {
            options.services.j12z-webserver = {
              enable = mkEnableOption "Service web j12zdotcom avec Caddy";

              domain = mkOption {
                type = types.str;
                default = "jeremiealcaraz.com";
                description = "Nom de domaine principal";
              };

              wwwDomain = mkOption {
                type = types.str;
                default = "www.jeremiealcaraz.com";
                description = "Alias www du domaine";
              };

              email = mkOption {
                type = types.str;
                default = "hello@jeremiealcaraz.com";
                description = "Email pour les certificats SSL";
              };

              siteRoot = mkOption {
                type = types.path;
                default = siteBuild;
                description = "Chemin vers le site buildé";
              };

              enableCloudflaredTunnel = mkOption {
                type = types.bool;
                default = false;
                description = "Activer le tunnel Cloudflare";
              };

              cloudflaredTokenFile = mkOption {
                type = types.nullOr types.path;
                default = null;
                description = "Fichier contenant le token Cloudflare Tunnel";
              };
            };

            config = mkIf cfg.enable {
              # Configuration Caddy
              services.caddy = {
                enable = true;
                email = cfg.email;

                # Configuration via fichier Caddyfile
                virtualHosts = {
                  "${cfg.domain}" = {
                    extraConfig = ''
                      # Servir les fichiers statiques
                      root * ${cfg.siteRoot}
                      file_server

                      # Gestion des erreurs
                      handle_errors {
                        @404 {
                          expression {http.error.status_code} == 404
                        }
                        rewrite @404 /404.html
                        file_server
                      }

                      # Compression
                      encode gzip zstd

                      # Headers de sécurité
                      header {
                        X-Frame-Options "SAMEORIGIN"
                        X-Content-Type-Options "nosniff"
                        X-XSS-Protection "1; mode=block"
                        Referrer-Policy "strict-origin-when-cross-origin"
                        Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; frame-src 'self' https:; connect-src 'self' https:;"
                        Permissions-Policy "geolocation=(), microphone=(), camera=()"
                        -Server
                      }

                      # Logs
                      log {
                        output file /var/log/caddy/${cfg.domain}.log {
                          roll_size 100mb
                          roll_keep 10
                          roll_keep_for 720h
                        }
                        format json
                        level INFO
                      }
                    '';
                  };

                  "${cfg.wwwDomain}" = {
                    extraConfig = ''
                      redir https://${cfg.domain}{uri}
                    '';
                  };
                };
              };

              # Ouvrir les ports nécessaires
              networking.firewall = {
                enable = true;
                allowedTCPPorts = [ 80 443 ];
                allowedUDPPorts = [ 443 ]; # HTTP/3 (QUIC)
              };

              # Service Cloudflare Tunnel (si activé)
              systemd.services.cloudflared = mkIf cfg.enableCloudflaredTunnel {
                description = "Cloudflare Tunnel";
                after = [ "network.target" ];
                wantedBy = [ "multi-user.target" ];

                serviceConfig = {
                  Type = "simple";
                  Restart = "always";
                  RestartSec = "5s";
                  ExecStart =
                    if cfg.cloudflaredTokenFile != null then
                      "${pkgs.cloudflared}/bin/cloudflared tunnel --no-autoupdate run --token $(cat ${cfg.cloudflaredTokenFile})"
                    else
                      throw "cloudflaredTokenFile must be set when enableCloudflaredTunnel is true";

                  # Sécurité
                  DynamicUser = true;
                  ProtectSystem = "strict";
                  ProtectHome = true;
                  NoNewPrivileges = true;
                  PrivateTmp = true;
                  ProtectKernelTunables = true;
                  ProtectControlGroups = true;
                  RestrictAddressFamilies = [ "AF_INET" "AF_INET6" ];
                  RestrictNamespaces = true;
                  LockPersonality = true;
                  MemoryDenyWriteExecute = true;
                  RestrictRealtime = true;
                  RestrictSUIDSGID = true;
                  PrivateMounts = true;
                };
              };

              # Créer le dossier de logs pour Caddy
              systemd.tmpfiles.rules = [
                "d /var/log/caddy 0755 caddy caddy -"
              ];
            };
          };
      };
    };
}
