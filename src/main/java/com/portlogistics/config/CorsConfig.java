package com.portlogistics.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // 允许所有前端地址访问 /api 开头的接口
        registry.addMapping("/api/**")
                .allowedOrigins("*") // 开发环境允许所有跨域（生产环境可限制具体域名）
                .allowedMethods("GET", "POST", "PUT", "DELETE") // 允许的请求方式
                .allowedHeaders("*") // 允许所有请求头
                .maxAge(3600); // 预检请求缓存时间（减少重复预检）
    }
}