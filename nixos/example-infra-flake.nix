# Exemple de flake.nix pour un repo infrastructure
# À créer dans un dépôt séparé (par ex: infra-nixos/)
{
  description = "Infrastructure NixOS pour mes services";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.05";

    # Import de la flake j12zdotcom
    j12z = {
      url = "github:JeremieAlcaraz/j12zdotcom";
      inputs.nixpkgs.follows = "nixpkgs";  # Évite les duplications de nixpkgs
    };
  };

  outputs = { self, nixpkgs, j12z }: {
    nixosConfigurations = {
      # Configuration pour ton serveur de production
      webserver = nixpkgs.lib.nixosSystem {
        system = "x86_64-linux";
        modules = [
          # Ta config hardware (généré par nixos-generate-config)
          # ./hardware-configuration.nix

          # Import du module NixOS depuis la flake j12z
          j12z.nixosModules.default

          # Configuration du service
          {
            services.j12z-webserver = {
              enable = true;
              domain = "jeremiealcaraz.com";
              wwwDomain = "www.jeremiealcaraz.com";
              email = "hello@jeremiealcaraz.com";

              # Pointer vers le site buildé de la flake
              siteRoot = j12z.packages.x86_64-linux.site;

              # Optionnel : Cloudflare Tunnel
              enableCloudflaredTunnel = false;
              # cloudflaredTokenFile = "/run/secrets/cloudflare-token";
            };

            # Autres configs système
            networking.hostName = "webserver";
            time.timeZone = "Europe/Paris";

            # SSH, users, etc.
            services.openssh.enable = true;
            users.users.admin = {
              isNormalUser = true;
              extraGroups = [ "wheel" ];
              openssh.authorizedKeys.keys = [
                "ssh-ed25519 AAAA..."
              ];
            };
          }
        ];
      };

      # Autre serveur (si tu as plusieurs machines)
      # staging = nixpkgs.lib.nixosSystem { ... };
    };
  };
}
