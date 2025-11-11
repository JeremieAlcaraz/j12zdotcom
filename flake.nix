{
  description = "j12zdotcom - Site personnel de Jérémie Alcaraz (Astro)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
    in
    flake-utils.lib.eachSystem systems (system:
      let
        pkgs = import nixpkgs { inherit system; };

        # Toolchain
        nodejs = pkgs.nodejs_20;

        buildInputs = with pkgs; [
          nodejs
          pnpm_9
          vips          # libvips pour sharp
        ];

        # Snapshot PNPM offline pour build pur Nix
        pnpmDeps = pkgs.pnpm_9.fetchDeps {
          pname = "j12zdotcom";
          version = "1.0.0";
          src = ./.;
          # ← Laisse vide, on le remplit après un 1er build (Nix affichera "got: sha256-...")
          hash = "sha256-VoMuC3ETP90K9H5b0xDT4OGG0CmLpfDln5EF12gz5S0=";
        };

        # Build du site Astro
        site = pkgs.stdenv.mkDerivation {
          pname = "j12zdotcom";
          version = "1.0.0";
          src = ./.;

          # Expose pnpmDeps au hook
          inherit pnpmDeps;

          # Le hook configure PNPM pour utiliser pnpmDeps en offline
          nativeBuildInputs = buildInputs ++ [ pkgs.pnpm_9.configHook ];

          # Env
          # On veut que sharp utilise la libvips système (et non les binaires téléchargés)
          SHARP_IGNORE_GLOBAL_LIBVIPS = "0";

          buildPhase = ''
            set -eux
            export HOME=$TMPDIR
            export PNPM_HOME=$TMPDIR/.pnpm-home

            # Installer AVEC devDependencies pour que les plugins Astro (ex: @astrojs/mdx) soient présents
            unset NODE_ENV
            pnpm install --offline --frozen-lockfile

            # Build en mode production
            export NODE_ENV=production
            pnpm build
          '';

          installPhase = ''
            set -eux
            mkdir -p "$out"
            if [ -d "dist" ]; then
              cp -r dist/* "$out/"
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
        # Paquets
        packages = {
          default = site;
          site = site;
        };

        # Shell dev
        devShells.default = pkgs.mkShell {
          buildInputs = buildInputs ++ (with pkgs; [ git docker docker-compose ]);
          shellHook = ''
            echo "🚀 Environnement de développement j12zdotcom"
            echo "Node.js: $(node --version)"
            echo "pnpm: $(pnpm --version)"
            echo
            echo "Commandes:"
            echo "  pnpm dev     - Dev server"
            echo "  pnpm build   - Build"
            echo "  pnpm preview - Preview"
            echo
          '';
        };

        # Apps
        apps = {
          dev = {
            type = "app";
            program = "${pkgs.writeShellScript "dev" ''
              ${pkgs.pnpm_9}/bin/pnpm dev
            ''}";
          };
          build = {
            type = "app";
            program = "${pkgs.writeShellScript "build" ''
              ${pkgs.pnpm_9}/bin/pnpm build
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
              services.caddy = {
                enable = true;
                email = cfg.email;

                virtualHosts = {
                  "${cfg.domain}" = {
                    extraConfig = ''
                      root * ${cfg.siteRoot}
                      file_server

                      handle_errors {
                        @404 {
                          expression {http.error.status_code} == 404
                        }
                        rewrite @404 /404.html
                        file_server
                      }

                      encode gzip zstd

                      header {
                        X-Frame-Options "SAMEORIGIN"
                        X-Content-Type-Options "nosniff"
                        X-XSS-Protection "1; mode=block"
                        Referrer-Policy "strict-origin-when-cross-origin"
                        Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; frame-src 'self' https:; connect-src 'self' https:;"
                        Permissions-Policy "geolocation=(), microphone=(), camera=()"
                        -Server
                      }

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

              networking.firewall = {
                enable = true;
                allowedTCPPorts = [ 80 443 ];
                allowedUDPPorts = [ 443 ]; # HTTP/3 (QUIC)
              };

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

              systemd.tmpfiles.rules = [
                "d /var/log/caddy 0755 caddy caddy -"
              ];
            };
          };
      };
    };
}
