/**/

package fr.inria.ilda.miis;

import java.text.SimpleDateFormat;
import java.util.Locale;
import java.util.Date;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;

import org.glassfish.grizzly.http.server.HttpHandler;
import org.glassfish.grizzly.http.server.HttpServer;
import org.glassfish.grizzly.http.server.NetworkListener;
import org.glassfish.grizzly.http.server.Request;
import org.glassfish.grizzly.http.server.Response;

import certificates.MyCertificate;
import com.myscript.edk.java.music.ScoreToMusicXML;
import com.myscript.engine.Engine;
import com.myscript.engine.EngineObject;
import com.myscript.ink.Ink;
import com.myscript.ink.InkStroke;
import com.myscript.ink.InkTagIterator;
import com.myscript.ink.InkTagQuery;
import com.myscript.json.Json;
import com.myscript.music.MusicAlphabetKnowledge;
import com.myscript.music.MusicDocument;
import com.myscript.music.MusicGrammar;
import com.myscript.music.MusicRecognizer;
import com.myscript.music.MusicScore;

public class WebService {

    // Grizzly
    static int PORT = 8086;
    private HttpServer server;

    File TMP_DIR = null;

    // MyScript
    private Engine engine;
    private MusicRecognizer recognizer;

    WebService(){

        TMP_DIR = new File(System.getProperty("user.home")+File.separator+"tmp");
        if (!TMP_DIR.exists()){
            try {
                System.out.println("Creating tmp dir "+TMP_DIR.getCanonicalPath());
                TMP_DIR.mkdir();
            }
            catch (IOException ex){ex.printStackTrace();}
        }

        initMyScriptRecognizer();
    }

    void initServer(){
        server = HttpServer.createSimpleServer();

        Runtime.getRuntime().addShutdownHook(new Thread(new Runnable() {
            @Override
            public void run() {
                System.out.println("Shutting down MIIS Web Service...");
                disposeMyScriptRecognizer();
                server.shutdownNow();
                System.out.println("MIIS Web Service fully shut down");
            }
        }));

        server.addListener(new NetworkListener("grizzly", "localhost", WebService.PORT));
        server.getServerConfiguration().addHttpHandler(
            new HttpHandler() {
                public void service(Request request, Response response) throws Exception {
                    request.setCharacterEncoding("UTF-8");
                    System.out.println("Handling " + request.getMethod() + "request");
                    String jink = request.getPostBody(1024).toStringContent();
                    final SimpleDateFormat format = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz", Locale.US);
                    final String date = format.format(new Date(System.currentTimeMillis()));
                    response.setContentType("application/xml");
                    response.addHeader("Access-Control-Allow-Headers", "x-requested-with,Content-Type,Access-Control-Allow-Methods,Access-Control-Allow-Origin");
                    response.addHeader("Access-Control-Allow-Origin", "*");
                    response.addHeader("Access-Control-Allow-Methods", "GET, POST");
                    response.addHeader("Access-Control-Max-Age", "60");
                    System.out.println("Serving request on " + date);
                    if (request.getMethod().getMethodString().equals("POST")){
                        sendMusicXML(jink, response);
                    }
                    // String content = date;
                    // response.getWriter().write(content);
                }
            },
            "/myscriptmusic");
        try {
            server.start();
            System.in.read();
        }
        catch (Exception ex){
            System.err.println("Error while initializing server");
            ex.printStackTrace();
        }
    }

    void sendMusicXML(String jink, Response response){
        String inkFile = null;
        try {
            inkFile = TMP_DIR.getCanonicalPath()+File.separator+"music-"+System.currentTimeMillis()+".jink";
            final String path = new File(inkFile).getCanonicalPath();
            System.out.println("Writing JINK to tmp file " + path);
            final PrintWriter tmpFile = new PrintWriter(path);
            tmpFile.print(jink);
            tmpFile.flush();
            tmpFile.close();
        }
        catch (IOException ex){
            System.out.println("Error writing tmp file");
            ex.printStackTrace();
        }
        System.out.println("Creating a new MusicDocument");
        final MusicDocument document = MusicDocument.create(engine);
        // System.out.println(" . MusicDocument created successfully");
        // System.out.println();
        // System.out.println("Processing input file "+inkFile);
        try {
            // System.out.println(" . parsing: " + new File(inkFile).getCanonicalPath());
            parseInput(inkFile, document);
            // System.out.println("   . input parsed successfully");
            System.out.println("Running the music recognition process");
            recognizer.process(document);
            // System.out.println("   . music recognition performed successfully");
            // System.out.println(" . retrieving the recognition result");
            final MusicScore score = document.getScore();
            if (score != null){
                String scoreAsString = ScoreToMusicXML.format(score);
                response.setContentLength(scoreAsString.length());
                response.getWriter().write(scoreAsString);
                System.out.println("   . score sent as MusicXML: ");
                score.dispose();
            }
            else {
                System.out.println(" . no recognition result");
                response.getWriter().write(" . no recognition result");
            }      
        }
        catch(IOException ex){
            System.err.println("Error parsing input ink.");
            ex.printStackTrace();
        }
        // do not forget the 1st rule: you create it, you dispose of it !
        // System.out.println("6) cleaning-up: disposing of objects and disposing of the Engine");
        document.dispose();        

    }

    void initMyScriptRecognizer(){
        System.out.println("--- Initializing MyScript engine...");        
        // System.out.println("1) creating a new Engine initialized with your certificate");
        engine = Engine.create(MyCertificate.getBytes());
        // System.out.println(" . Engine created successfully");
        // System.out.println();
    
        // System.out.println("2) creating a new MusicRecognizer");
        recognizer = MusicRecognizer.create(engine);
        System.out.println(" . MusicRecognizer created successfully");
        // System.out.println();
    
        // System.out.println("3) loading and attaching resources to the recognizer");
        final MusicAlphabetKnowledge ak = (MusicAlphabetKnowledge)EngineObject.load(engine, "data/music/music-ak.res");
        // System.out.println(" . MusicAlphabetKnowledge resource loaded successfully");
        recognizer.attach(ak);
        System.out.println(" . MusicAlphabetKnowledge resource attached successfully");
        // System.out.println(" . disposing of the MusicAlphabetKnowledge resource (not needed anymore)");
        ak.dispose();
        // System.out.println(" . MusicAlphabetKnowledge resource disposed of successfully");

        final MusicGrammar grm = (MusicGrammar)EngineObject.load(engine, "data/music/music-grm-standard.res");
        // System.out.println(" . MusicGrammar resource loaded successfully");
        recognizer.attach(grm);
        System.out.println(" . MusicGrammar resource attached successfully");
        // System.out.println(" . disposing of the MusicGrammar resource (not needed anymore)");
        grm.dispose();
        // System.out.println(" . MusicGrammar resource disposed of successfully");
        // System.out.println();
        System.out.println("--- MyScript engine fully initialized");
    }

    void disposeMyScriptRecognizer(){
        System.out.print(" --- Disposing MyScript engine...");
        recognizer.dispose();
        engine.dispose();
        System.out.println("done");
    }

    // void testMyScriptRecognizer(){
    //     System.out.println("Creating a new MusicDocument");
    //     final MusicDocument document = MusicDocument.create(engine);
    //     // System.out.println(" . MusicDocument created successfully");
    //     // System.out.println();
    //     String inkFile = "data/music.jink";
    //     System.out.println("Processing input file "+inkFile);
    //     try {
    //         // System.out.println(" . parsing: " + new File(inkFile).getCanonicalPath());
    //         parseInput(inkFile, document);
    //         // System.out.println("   . input parsed successfully");
    //         System.out.println("Running the music recognition process");
    //         recognizer.process(document);
    //         // System.out.println("   . music recognition performed successfully");
    //         // System.out.println(" . retrieving the recognition result");
    //         final MusicScore score = document.getScore();
    //         if (score != null){
    //             final String path = new File("data/MusicRecognition-output.xml").getCanonicalPath();
    //             final PrintWriter outputFile = new PrintWriter(path);
    //             outputFile.print(ScoreToMusicXML.format(score));
    //             outputFile.close();
    //             System.out.println("   . score stored as MusicXML: " + path);
    //             System.out.println();
    //             score.dispose();
    //         }
    //         else {
    //             System.out.println(" . no recognition result");
    //         }      
    //     }
    //     catch(IOException ex){
    //         System.err.println("Error parsing input ink.");
    //         ex.printStackTrace();
    //     }
    //     // do not forget the 1st rule: you create it, you dispose of it !
    //     // System.out.println("6) cleaning-up: disposing of objects and disposing of the Engine");
    //     document.dispose();        
    // }

    public static void main(String[] args){
        System.out.println("Starting MIIS Web Service");
        (new WebService()).initServer();
    }

    private final static void parseInput(final String path, MusicDocument document) {
        final Ink ink = (Ink) EngineObject.load(document.getEngine(), path);

        final InkTagQuery query = new InkTagQuery();
        query.name = "STAFF";
        final InkTagIterator tagIterator = ink.tagLookup(query);
        final Json data = (Json) tagIterator.getData();

        Json value;

        value = data.getObjectEntryValue("count");
        final int count = (int) value.getNumberValue();
        value.dispose();

        value = data.getObjectEntryValue("top");
        final float top = (float) value.getNumberValue();
        value.dispose();

        value = data.getObjectEntryValue("gap");
        final float gap = (float) value.getNumberValue();
        value.dispose();

        document.addStaff(count, top, gap);

        for (int i = 0; i < ink.getStrokeCount(); ++i) {
            final InkStroke stroke = ink.getStrokeAt(i);

            document.addStroke(stroke.getValuesAsFloat(0), stroke.getValuesAsFloat(1));

            stroke.dispose();
        }

        data.dispose();
        tagIterator.dispose();
        ink.dispose();
    }

}
