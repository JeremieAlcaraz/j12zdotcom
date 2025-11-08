# Exemple de configuration NixOS pour déployer j12zdotcom
#
# Ce fichier doit être placé dans /etc/nixos/flake.nix sur votre serveur
#
# Usage:
#   1. Copier ce fichier vers /etc/nixos/flake.nix
#   2. Adapter les valeurs (email, domaine, etc.)
#   3. Créer le fichier de secret : /run/secrets/cloudflare-tunnel-token
#   4. Exécuter : sudo nixos-rebuild switch --flake .#jeremie-web

{
  description = "Configuration NixOS du serveur web jeremiealcaraz.com";

  inputs = {
    # Version stable de NixOS (24.05)
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.05";

    # Import du site depuis GitHub
    j12z-site = {
      url = "github:JeremieAlcaraz/j12zdotcom";
      # Utilise la même version de nixpkgs que le système
      inputs.nixpkgs.follows = "nixpkgs";
    };

    # Optionnel : gestion des secrets avec sops-nix
    # sops-nix = {
    #   url = "github:Mic92/sops-nix";
    #   inputs.nixpkgs.follows = "nixpkgs";
    # };
  };

  outputs = { self, nixpkgs, j12z-site, ... }@inputs:
    {
      nixosConfigurations = {
        # Configuration du serveur web de production
        jeremie-web = nixpkgs.lib.nixosSystem {
          system = "x86_64-linux";

          modules = [
            # ========================================
            # 1. Configuration matérielle
            # ========================================
            # Ce fichier est généré automatiquement lors de l'installation de NixOS
            ./hardware-configuration.nix

            # ========================================
            # 2. Configuration de base du système
            # ========================================
            {
              # Nom d'hôte du serveur
              networking.hostName = "jeremie-web";

              # Timezone
              time.timeZone = "Europe/Paris";

              # Locale
              i18n.defaultLocale = "en_US.UTF-8";
              console.keyMap = "fr";

              # Utilisateur principal (ajustez selon vos besoins)
              users.users.jeremie = {
                isNormalUser = true;
                extraGroups = [ "wheel" "networkmanager" ];
                openssh.authorizedKeys.keys = [
                  # Ajoutez votre clé SSH publique ici
                  # "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIxxx... jeremie@laptop"
                ];
              };

              # SSH
              services.openssh = {
                enable = true;
                settings = {
                  PermitRootLogin = "prohibit-password";
                  PasswordAuthentication = false;
                };
              };

              # Firewall (géré par le module j12z-webserver)
              networking.firewall.enable = true;

              # Activer les flakes
              nix.settings = {
                experimental-features = [ "nix-command" "flakes" ];
                auto-optimise-store = true;
              };

              # Garbage collection automatique (nettoie les anciennes générations)
              nix.gc = {
                automatic = true;
                dates = "weekly";
                options = "--delete-older-than 30d";
              };

              # Mises à jour automatiques de sécurité
              system.autoUpgrade = {
                enable = true;
                allowReboot = false; # Mettre à true si vous voulez des reboots auto
                dates = "04:00";
                flake = "/etc/nixos";
              };
            }

            # ========================================
            # 3. Module du site web
            # ========================================
            j12z-site.nixosModules.j12z-webserver

            # ========================================
            # 4. Configuration spécifique du site
            # ========================================
            {
              services.j12z-webserver = {
                # Activer le webserver
                enable = true;

                # Configuration des domaines
                domain = "jeremiealcaraz.com";
                wwwDomain = "www.jeremiealcaraz.com";

                # Email pour Let's Encrypt (certificats SSL)
                email = "hello@jeremiealcaraz.com";

                # Activer le tunnel Cloudflare
                enableCloudflaredTunnel = true;

                # Fichier contenant le token Cloudflare Tunnel
                # Créez-le avec :
                #   sudo mkdir -p /run/secrets
                #   echo "votre-token" | sudo tee /run/secrets/cloudflare-tunnel-token
                #   sudo chmod 600 /run/secrets/cloudflare-tunnel-token
                cloudflaredTokenFile = "/run/secrets/cloudflare-tunnel-token";

                # Optionnel : chemin custom du site buildé
                # Par défaut, utilise le build depuis la flake du site
                # siteRoot = /path/to/custom/build;
              };
            }

            # ========================================
            # 5. Optionnel : Configuration sops-nix
            # ========================================
            # Décommentez pour utiliser sops-nix (gestion sécurisée des secrets)
            # inputs.sops-nix.nixosModules.sops
            # {
            #   sops = {
            #     defaultSopsFile = ./secrets.yaml;
            #     age.keyFile = "/var/lib/sops-nix/key.txt";
            #
            #     secrets.cloudflare-tunnel-token = {
            #       owner = "cloudflared";
            #     };
            #   };
            #
            #   # Utiliser le secret dans le service
            #   services.j12z-webserver.cloudflaredTokenFile =
            #     config.sops.secrets.cloudflare-tunnel-token.path;
            # }
          ];
        };

        # ========================================
        # Configuration optionnelle : environnement de staging
        # ========================================
        # jeremie-web-staging = nixpkgs.lib.nixosSystem {
        #   system = "x86_64-linux";
        #   modules = [
        #     ./hardware-configuration.nix
        #     j12z-site.nixosModules.j12z-webserver
        #     {
        #       services.j12z-webserver = {
        #         enable = true;
        #         domain = "staging.jeremiealcaraz.com";
        #         # ... autres configs
        #       };
        #     }
        #   ];
        # };
      };
    };
}
