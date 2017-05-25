package com.github.justlive1.common.map.conf;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import com.github.justlive1.common.map.controller.MapFullController;
import com.github.justlive1.common.map.service.MapFullService;
import com.github.justlive1.common.map.service.MapFullServiceImpl;

/**
 * app配置及相关bean
 * 
 * @author wubo
 *
 */
@Configuration
@ComponentScan(basePackageClasses = MapFullController.class)
public class AppConfig {

	@Bean
	public RestTemplate restTemplate() {

		RestTemplate template = new RestTemplate();

		SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
		factory.setReadTimeout(5000);
		factory.setConnectTimeout(5000);

		template.setRequestFactory(factory);

		return template;
	}

	@Bean
	public MapFullService mapFullService() {

		MapFullService mapService = new MapFullServiceImpl();

		return mapService;
	}
}
