package com.moneyverse.presentation;

import com.moneyverse.api.domain.web.NativeHomeController;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.Map;

/** Public shells reuse the same-origin source reader without importing financial services. */
@Controller
public class NativePublicFeaturePageController {
    private final NativeHomeController home;
    public NativePublicFeaturePageController(NativeHomeController home) { this.home=home; }

    @GetMapping(value={"/stocks","/shop","/board"},produces=MediaType.TEXT_HTML_VALUE)
    public String show(HttpServletRequest request,HttpServletResponse response,Model model) {
        String template=home.home(request,response,model);
        model.addAttribute("uiPageKey",Map.of("/stocks","stocks","/shop","shop","/board","board").get(request.getRequestURI()));
        return template;
    }
}
