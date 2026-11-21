package com.moneyverse.api.domain.admin.web;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.web.UiLocale;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

@Component
public class AdminNavigation {
    public record Entry(String href,String category,String labelKey,String categoryKey) {}
    public record Tool(String href,String category,String labelKey,String categoryKey,
                       String label,String categoryLabel,String search) {}
    private final List<Entry> entries;
    private final UiLocale locale;

    public AdminNavigation(ObjectMapper mapper,UiLocale locale) {
        this.locale=locale;
        try (var input=new ClassPathResource("ui/admin-tools.json").getInputStream()) {
            entries=List.copyOf(mapper.readValue(input,new TypeReference<List<Entry>>() {}));
            var english=locale.labels("en");
            if(entries.size()!=35 || entries.stream().map(Entry::href).distinct().count()!=35
                    || entries.stream().anyMatch(e -> e.href()==null || !e.href().matches("/admin(?:/[a-z0-9-]+)+")
                    || !english.containsKey(e.labelKey()) || !english.containsKey(e.categoryKey()))) {
                throw new IllegalStateException("Admin tool directory is incomplete");
            }
        } catch(IOException error) {
            throw new IllegalStateException("Admin tool directory unavailable",error);
        }
    }

    public List<Tool> tools(String language) {
        var copy=locale.labels(language);
        var searchLabels=List.of("en","ko","ja","zh","vi").stream().map(locale::labels).toList();
        return entries.stream().map(e -> new Tool(e.href(),e.category(),e.labelKey(),e.categoryKey(),
                copy.get(e.labelKey()),copy.get(e.categoryKey()),
                searchLabels.stream()
                    .map(labels -> labels.get(e.labelKey()))
                    .collect(java.util.stream.Collectors.joining(" "))+" "+e.href())).toList();
    }
}
