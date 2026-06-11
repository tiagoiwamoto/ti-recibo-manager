package br.com.iwarecibos.api.config.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Converts a Keycloak access token into Spring authorities, merging the default
 * scope-based authorities with realm roles ({@code realm_access.roles}) and the
 * client roles for the configured resource id ({@code resource_access.<id>.roles}).
 */
@Component
public class KeycloakJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();

    private final String resourceId;

    public KeycloakJwtAuthenticationConverter(
            @Value("${app.security.oauth2.resource-id:tirecibomanager-frontend}") String resourceId) {
        this.resourceId = resourceId;
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = Stream.of(
                        jwtGrantedAuthoritiesConverter.convert(jwt).stream(),
                        extractRealmRoles(jwt).stream(),
                        extractResourceRoles(jwt).stream())
                .flatMap(stream -> stream)
                .collect(Collectors.toSet());

        return new JwtAuthenticationToken(jwt, authorities, jwt.getClaimAsString("preferred_username"));
    }

    @SuppressWarnings("unchecked")
    private Collection<GrantedAuthority> extractRealmRoles(Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess == null) {
            return List.of();
        }
        Object roles = realmAccess.get("roles");
        if (!(roles instanceof Collection<?> roleList)) {
            return List.of();
        }
        return ((Collection<String>) roleList).stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toSet());
    }

    @SuppressWarnings("unchecked")
    private Collection<GrantedAuthority> extractResourceRoles(Jwt jwt) {
        Map<String, Object> resourceAccess = jwt.getClaim("resource_access");
        if (resourceAccess == null) {
            return List.of();
        }
        Object resource = resourceAccess.get(resourceId);
        if (!(resource instanceof Map<?, ?> resourceMap)) {
            return List.of();
        }
        Object roles = resourceMap.get("roles");
        if (!(roles instanceof Collection<?> roleList)) {
            return List.of();
        }
        return ((Collection<String>) roleList).stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toSet());
    }
}
