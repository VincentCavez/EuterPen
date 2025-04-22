# Music iink server Install

Music iink server is a Web service that runs the MyScript engine configured with a custom grammar for the modern staff notation.

It requires the Java application to be compiled using a valid certificate in `src/main/jaba/certificates/MyCertificate.java`

## Requirements

- Maven https://maven.apache.org
- MyScript dev kit 8.11.1 with native libraries for your platform (tested with Windows 11 arm64, linux x64)

## Setup

- Unzip all MyScript archives to the same directory.
- Install all MyScript JAR files (found in `edk/java/bin`) in the local Maven repository using `myscript2maven.sh`
- Setup Java's native library path ($LD_LIBRARY_PATH on Linux, %PATH% on Windows, or using -Djava.library.path) to point to where you put the `.dll` or `.so` files, including: `MyScriptEngine.dll` and `MyScriptMusic.dll`. On Windows 11, this will be in Settings -> System -> About -> Advanced system settings -> Advanced -> Environment Variables...

## Compile

`mvn clean package`

## Run

`./run.sh` or equivalent `java -jar target/music-iink-server-0.1.jar fr.inria.ilda.miis.WebService`

## Test

Access `src/main/resources/web/test.html` from a local HTTP server. Write some music and Call Miis.
