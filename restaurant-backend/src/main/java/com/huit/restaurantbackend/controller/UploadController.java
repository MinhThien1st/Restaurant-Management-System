package com.huit.restaurantbackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    @PostMapping
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng chọn một tệp tin ảnh."));
        }

        try {
            // Find user directory
            String userDir = System.getProperty("user.dir");
            Path projectPath = Paths.get(userDir);
            
            // If running inside restaurant-backend directory, the parent is the project root containing restaurant-frontend
            if (projectPath.getFileName().toString().equals("restaurant-backend")) {
                projectPath = projectPath.getParent();
            }
            
            Path uploadDir = projectPath.resolve("restaurant-frontend").resolve("images");
            
            // Ensure directory exists
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            // Sanitize filename & make unique
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            String sanitizedBaseName = "upload";
            if (originalFilename != null) {
                String nameWithoutExt = originalFilename.contains(".") 
                        ? originalFilename.substring(0, originalFilename.lastIndexOf(".")) 
                        : originalFilename;
                sanitizedBaseName = nameWithoutExt.replaceAll("[^a-zA-Z0-9.-]", "_");
            }
            
            String newFilename = System.currentTimeMillis() + "_" + sanitizedBaseName + extension;
            Path filePath = uploadDir.resolve(newFilename);

            // Copy file content
            Files.copy(file.getInputStream(), filePath);

            // Return relative path to frontend image
            String relativeUrl = "images/" + newFilename;
            return ResponseEntity.ok(Map.of("imageUrl", relativeUrl));

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", "Lỗi khi lưu tệp tin: " + e.getMessage()));
        }
    }
}
