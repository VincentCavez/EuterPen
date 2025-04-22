#!/bin/sh
mvn install:install-file -Dfile=com.myscript.edk.java.jar -DgroupId=com.myscript -DartifactId=myscript-edk.java -Dversion=8.11.1 -Dpackaging=jar
mvn install:install-file -Dfile=com.myscript.engine.jar -DgroupId=com.myscript -DartifactId=myscript-engine -Dversion=8.11.1 -Dpackaging=jar
mvn install:install-file -Dfile=com.myscript.ink.jar -DgroupId=com.myscript -DartifactId=myscript-ink -Dversion=8.11.1 -Dpackaging=jar
mvn install:install-file -Dfile=com.myscript.keyboard.jar -DgroupId=com.myscript -DartifactId=myscript-keyboard -Dversion=8.11.1 -Dpackaging=jar
mvn install:install-file -Dfile=com.myscript.math.jar -DgroupId=com.myscript -DartifactId=myscript-math -Dversion=8.11.1 -Dpackaging=jar
mvn install:install-file -Dfile=com.myscript.music.jar -DgroupId=com.myscript -DartifactId=myscript-music -Dversion=8.11.1 -Dpackaging=jar
mvn install:install-file -Dfile=com.myscript.prediction.jar -DgroupId=com.myscript -DartifactId=myscript-prediction -Dversion=8.11.1 -Dpackaging=jar
mvn install:install-file -Dfile=com.myscript.shape.jar -DgroupId=com.myscript -DartifactId=myscript-shape -Dversion=8.11.1 -Dpackaging=jar
mvn install:install-file -Dfile=com.myscript.text.jar -DgroupId=com.myscript -DartifactId=myscript-text -Dversion=8.11.1 -Dpackaging=jar
