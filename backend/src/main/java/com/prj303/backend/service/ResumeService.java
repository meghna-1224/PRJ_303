package com.prj303.backend.service;

import com.prj303.backend.entity.Resume;
import com.prj303.backend.entity.User;
import com.prj303.backend.repository.ResumeRepository;
import com.prj303.backend.repository.UserRepository;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Set;

@Service
public class ResumeService {

        private final ResumeRepository resumeRepository;
        private final UserRepository userRepository;

        private final Path uploadDirectory = Paths.get("uploads/resumes");

        public ResumeService(
                        ResumeRepository resumeRepository,
                        UserRepository userRepository) {

                this.resumeRepository = resumeRepository;
                this.userRepository = userRepository;
        }

        public Resume uploadResume(
                        Long userId,
                        MultipartFile file) throws IOException {

                // 1. Find the user
                User user = userRepository.findById(userId)
                                .orElseThrow(
                                                () -> new RuntimeException("User not found"));

                // 2. Check that a file was selected
                if (file == null || file.isEmpty()) {

                        throw new RuntimeException(
                                        "Please select a resume file");
                }

                // 3. Check file size
                if (file.getSize() > 5 * 1024 * 1024) {

                        throw new RuntimeException(
                                        "Resume file must be smaller than 5 MB");
                }

                // 4. Get original filename
                String originalFileName = file.getOriginalFilename();

                if (originalFileName == null ||
                                originalFileName.isBlank()) {

                        throw new RuntimeException(
                                        "Invalid resume filename");
                }

                // 5. Check supported file types
                String lowerCaseName = originalFileName.toLowerCase();

                if (!lowerCaseName.endsWith(".pdf") &&
                                !lowerCaseName.endsWith(".doc") &&
                                !lowerCaseName.endsWith(".docx")) {

                        throw new RuntimeException(
                                        "Only PDF, DOC and DOCX files are supported");
                }

                // 6. Create upload directory
                Files.createDirectories(uploadDirectory);

                // 7. Find existing resume BEFORE saving the new one
                Resume existingResume = resumeRepository.findByUserId(userId)
                                .orElse(null);

                // 8. Delete the old physical resume file
                if (existingResume != null &&
                                existingResume.getFilePath() != null &&
                                !existingResume.getFilePath().isBlank()) {

                        try {

                                Path oldFilePath = Paths.get(
                                                existingResume.getFilePath());

                                Files.deleteIfExists(oldFilePath);

                        } catch (Exception e) {

                                // Do not stop the new upload if the old
                                // physical file cannot be deleted.
                                System.out.println(
                                                "Could not delete old resume file: "
                                                                + e.getMessage());
                        }
                }

                // 9. Create a unique filename for the new resume
                String storedFileName = userId + "_" +
                                System.currentTimeMillis() + "_" +
                                originalFileName;

                Path filePath = uploadDirectory.resolve(storedFileName);

                // 10. Save the new uploaded file
                Files.copy(
                                file.getInputStream(),
                                filePath);

                // 11. Reuse the existing database record
                // instead of creating another Resume row
                Resume resume = existingResume != null
                                ? existingResume
                                : new Resume();

                // 12. Store resume information
                resume.setUser(user);
                resume.setFileName(originalFileName);
                resume.setFileType(file.getContentType());
                resume.setFilePath(filePath.toString());
                resume.setUploadedAt(LocalDateTime.now());

                // 13. Extract text from PDF
                String extractedText = "";

                if (lowerCaseName.endsWith(".pdf")) {

                        try (
                                        PDDocument document = Loader.loadPDF(filePath.toFile())) {

                                PDFTextStripper pdfTextStripper = new PDFTextStripper();

                                extractedText = pdfTextStripper.getText(document);
                        }
                }

                // 14. Store extracted text
                resume.setExtractedText(extractedText);

                // 15. Extract skills from resume text
                String extractedSkills = extractSkills(extractedText);

                resume.setExtractedSkills(extractedSkills);

                // 16. Save/update the single resume record
                return resumeRepository.save(resume);
        }

        /**
         * Get the current resume for a user.
         */
        public Resume getResume(Long userId) {

                return resumeRepository
                                .findByUserId(userId)
                                .orElse(null);
        }

        /**
         * Extract technical skills mentioned in the resume.
         */
        private String extractSkills(String resumeText) {

                if (resumeText == null ||
                                resumeText.isBlank()) {

                        return "";
                }

                // Normalize resume text
                String normalizedText = resumeText
                                .toLowerCase()
                                .replaceAll(
                                                "[^a-z0-9+#.]+",
                                                " ")
                                .replaceAll(
                                                "\\s+",
                                                " ")
                                .trim();

                /*
                 * Controlled skill dictionary.
                 *
                 * Skills are detected only when they
                 * actually appear in the resume text.
                 */
                Set<String> skillDictionary = new LinkedHashSet<>(
                                Arrays.asList(

                                                "Python",
                                                "Java",
                                                "C",
                                                "C++",
                                                "SQL",
                                                "MySQL",
                                                "Firebase",

                                                "Git",
                                                "GitHub",

                                                "Django",
                                                "Spring Boot",
                                                "REST API",

                                                "React",
                                                "JavaScript",
                                                "HTML",
                                                "CSS",

                                                "Flutter",
                                                "Dart",
                                                "Android Studio",
                                                "XML",

                                                "OpenCV",
                                                "YOLO",

                                                "R",
                                                "Data Analysis",
                                                "Data Visualization",
                                                "Machine Learning",
                                                "NLP",

                                                "Selenium",
                                                "Software Testing",
                                                "Excel",

                                                "Arduino",
                                                "Raspberry Pi",

                                                "Google Maps API"));

                Set<String> detectedSkills = new LinkedHashSet<>();

                String paddedText = " " + normalizedText + " ";

                for (String skill : skillDictionary) {

                        String normalizedSkill = skill.toLowerCase()
                                        .replaceAll(
                                                        "[^a-z0-9+#.]+",
                                                        " ")
                                        .replaceAll(
                                                        "\\s+",
                                                        " ")
                                        .trim();

                        if (paddedText.contains(
                                        " " + normalizedSkill + " ")) {

                                detectedSkills.add(skill);
                        }
                }

                return String.join(
                                ", ",
                                detectedSkills);
        }
}