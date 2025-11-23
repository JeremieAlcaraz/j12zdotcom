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
          buildInputs = buildInputs ++ (with pkgs; [ git ]);
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
      # Export du module NixOS (défini séparément dans nixos/module.nix)
      nixosModules = {
        default = import ./nixos/module.nix;
        j12z-webserver = import ./nixos/module.nix;
      };
    };
}
