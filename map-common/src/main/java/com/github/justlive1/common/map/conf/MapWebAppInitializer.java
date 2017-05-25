package com.github.justlive1.common.map.conf;

import javax.servlet.FilterRegistration.Dynamic;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRegistration;

import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.filter.CharacterEncodingFilter;
import org.springframework.web.servlet.DispatcherServlet;
import org.springframework.web.util.WebUtils;

/**
 * web容器入口
 * 
 * @author wubo
 *
 */
public class MapWebAppInitializer implements WebApplicationInitializer {

	@Override
	public void onStartup(ServletContext container) throws ServletException {

		WebUtils.setWebAppRootSystemProperty(container);

		Dynamic filter = container.addFilter("characterEncodingFilter", new CharacterEncodingFilter("utf-8", true));
		filter.addMappingForUrlPatterns(null, false, "/*");

		AnnotationConfigWebApplicationContext servletAppContext = new AnnotationConfigWebApplicationContext();
		servletAppContext.register(AppConfig.class, WebConfig.class);
		ServletRegistration.Dynamic registration = container.addServlet("webjars", new DispatcherServlet(servletAppContext));
		registration.setLoadOnStartup(2);
		registration.addMapping("/");

	}

}
