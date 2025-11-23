# Module NixOS pour déployer le site j12zdotcom
{ config, lib, pkgs, ... }:

with lib;

let
  cfg = config.services.j12z-webserver;
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
}
