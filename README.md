# EuterPen Music Notation Program

EuterPen is a music notation program prototype implemented using Web technologies.

It runs in Web browsers, on Microsoft Surface Studio 2.

## Requirements

- The browser used should implement the W3C Pointers API (which is the case of most recent browsers including Google Chrome, or Mozilla Firefox).
- If intending to use the handwritten music notation recognition features, compile and run the corresponding Web service as described in [music-iink-server/README.md](music-iink-server/README.md).

## Running EuterPen

- Unpack the archive
- Serve the application through an local HTTP server, for instance locally by running `python3 -m http.server 8888` in the main directory.
- Access `localhost:8888/index.html` in your favorite Web browser (W3C Pointer API compliant).
