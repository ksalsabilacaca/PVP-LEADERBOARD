plugins {
    java
    id("com.gradleup.shadow") version "9.4.1"
}

group = "id.zulfahmifjr.zombierush"
version = "1.0.0"

repositories {
    mavenCentral()
    maven {
        name = "purpur"
        url = uri("https://repo.purpurmc.org/snapshots")
    }
}

dependencies {
    compileOnly("org.purpurmc.purpur:purpur-api:1.21.1-R0.1-SNAPSHOT")
    implementation("redis.clients:jedis:5.1.0")
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(21))
    }
}

tasks.withType<JavaCompile> {
    options.encoding = "UTF-8"
}

tasks.shadowJar {
    archiveBaseName.set("ZombieRush")
    archiveClassifier.set("")
    archiveVersion.set("1.0.0")
    relocate("redis.clients", "id.zulfahmifjr.zombierush.libs.redis.clients")
    relocate("org.apache.commons.pool2", "id.zulfahmifjr.zombierush.libs.org.apache.commons.pool2")
    mergeServiceFiles()
}

tasks.build {
    dependsOn(tasks.shadowJar)
}
