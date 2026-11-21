package com.moneyverse.api.domain.web;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@Component
public class UiPageRenderer {
    private final SpringTemplateEngine templates;
    private final UiLocale locale;
    public UiPageRenderer(SpringTemplateEngine templates, UiLocale locale) {
        this.templates=templates; this.locale=locale;
    }
    public String language(HttpServletRequest request) { return locale.resolve(request); }
    public String render(String template, HttpServletRequest request, Map<String,Object> attributes) {
        String language=language(request);
        Map<String,Object> model=new HashMap<>(attributes);
        model.put("uiLanguage",language);
        model.put("uiCopy",locale.labels(language));
        return templates.process(template,new Context(Locale.forLanguageTag(language),model));
    }
}
