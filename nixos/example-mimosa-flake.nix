# Exemple de flake.nix pour ton serveur mimosa
# À placer dans /etc/nixos/flake.nix
{
  description = "Infrastructure NixOS - Serveur mimosa";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.05";

    # Import de j12zdotcom
    j12z = {
      url = "github:JeremieAlcaraz/j12zdotcom";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, j12z }: {
    nixosConfigurations.mimosa = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      modules = [
        # Ta config hardware existante
        ./hardware-configuration.nix

        # Import du module j12z
        j12z.nixosModules.default

        # Configuration principale
        ({ config, pkgs, ... }: {
          # Hostname
          networking.hostName = "mimosa";

          # Timezone
          time.timeZone = "Europe/Paris";

          # Locale
          i18n.defaultLocale = "fr_FR.UTF-8";

          # Configuration du site j12zdotcom
          # 🎯 Ceci remplace tout ton script deploy-j12zdotcom.sh !
          services.j12z-webserver = {
            enable = true;
            domain = "jeremiealcaraz.com";
            wwwDomain = "www.jeremiealcaraz.com";
            email = "hello@jeremiealcaraz.com";

            # Le site est buildé automatiquement par Nix depuis la flake
            # Plus besoin de pnpm build manuel !
            siteRoot = j12z.packages.x86_64-linux.site;

            # Cloudflare Tunnel
            enableCloudflaredTunnel = true;
            cloudflaredTokenFile = "/run/secrets/cloudflare-token";
          };

          # SSH
          services.openssh = {
            enable = true;
            settings = {
              PermitRootLogin = "no";
              PasswordAuthentication = false;
            };
          };

          # Users (adapte selon ta config)
          users.users.jeremie = {
            isNormalUser = true;
            extraGroups = [ "wheel" "networkmanager" ];
            openssh.authorizedKeys.keys = [
              # Ajoute tes clés SSH ici
              # "ssh-ed25519 AAAA..."
            ];
          };

          # Sudo sans mot de passe pour wheel
          security.sudo.wheelNeedsPassword = false;

          # Nix settings
          nix = {
            settings = {
              experimental-features = [ "nix-command" "flakes" ];
              auto-optimise-store = true;
            };
            gc = {
              automatic = true;
              dates = "weekly";
              options = "--delete-older-than 30d";
            };
          };

          # Packages système
          environment.systemPackages = with pkgs; [
            vim
            git
            htop
            curl
            wget
          ];

          # Version NixOS
          system.stateVersion = "24.05";
        })
      ];
    };
  };
}
