package com.github.justlive1.map.conf;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRegistration;

import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.DispatcherServlet;

public class MapWebAppInitializer implements WebApplicationInitializer {

	@Override
	public void onStartup(ServletContext container) throws ServletException {
		AnnotationConfigWebApplicationContext servletAppContext = new AnnotationConfigWebApplicationContext();
		servletAppContext.register(WebConfig.class);
		ServletRegistration.Dynamic registration = container.addServlet("webjars", new DispatcherServlet(servletAppContext));
		registration.setLoadOnStartup(2);
		registration.addMapping("/*");

	}

}
