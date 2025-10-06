plugins {
    java
    jacoco
    id("com.github.johnrengelman.shadow") version "8.1.1"
    id("com.diffplug.spotless") version "6.23.3"
}

java { toolchain { languageVersion.set(JavaLanguageVersion.of(21)) } }

group = "app"
version = "0.1.0"

repositories { mavenCentral() }

dependencies {
    compileOnly("org.projectlombok:lombok:1.18.30")
    annotationProcessor("org.projectlombok:lombok:1.18.30")
    implementation("com.amazonaws:aws-java-sdk-dynamodb:1.12.744")
    implementation("software.amazon.awssdk:dynamodb-enhanced:2.25.61")
    implementation("software.amazon.awssdk:auth:2.25.61")
    implementation("software.amazon.awssdk:regions:2.25.61")

    implementation("com.google.dagger:dagger:2.51.1")
    annotationProcessor("com.google.dagger:dagger-compiler:2.51.1")

    implementation("com.fasterxml.jackson.core:jackson-databind:2.17.2")

    implementation("software.amazon.lambda:powertools-logging:1.18.0")

    implementation("com.amazonaws:aws-lambda-java-core:1.2.3")
    implementation("com.amazonaws:aws-lambda-java-events:3.14.0")
    
    testImplementation(platform("org.junit:junit-bom:5.10.3"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    testImplementation("org.mockito:mockito-core:5.5.0")
    testImplementation("org.mockito:mockito-junit-jupiter:5.5.0")
    testImplementation("org.mockito:mockito-core:5.5.0")
    testImplementation("org.mockito:mockito-junit-jupiter:5.5.0")
}


spotless {
    java {
        googleJavaFormat("1.17.0")
        target("src/**/*.java")
    }
}

tasks.withType<Jar> {
    manifest { attributes["Main-Class"] = "app.handlers.RouterHandler" }
}

tasks.test {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
        showStandardStreams = true
    }
    finalizedBy(tasks.jacocoTestReport)
}

tasks.jacocoTestReport {
    dependsOn(tasks.test)
    reports {
        xml.required.set(true)
        html.required.set(true)
        csv.required.set(false)
    }
    classDirectories.setFrom(
        files(classDirectories.files.map {
            fileTree(it) {
                exclude("app/di/**")
            }
        })
    )
}

tasks.jacocoTestCoverageVerification {
    classDirectories.setFrom(
        files(classDirectories.files.map {
            fileTree(it) {
                exclude("app/di/**")
            }
        })
    )
    violationRules {
        rule {
            limit {
                minimum = "0.30".toBigDecimal()
            }
        }
    }
}

tasks.named("check") { 
    dependsOn("spotlessCheck")
    dependsOn("jacocoTestCoverageVerification")
}