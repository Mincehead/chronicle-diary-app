/**
 * Voice Module - Web Speech API Integration
 * Handles voice-to-text functionality
 */

const VoiceRecorder = (() => {
    let recognition = null;
    let isRecording = false;
    let onTranscriptCallback = null;
    let onErrorCallback = null;
    let lastProcessedIndex = -1; // Track what we've already processed

    /**
     * Check if Web Speech API is supported
     * @returns {boolean}
     */
    const isSupported = () => {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    };

    /**
     * Initialize speech recognition
     * @param {Function} onTranscript - Callback for transcribed text
     * @param {Function} onError - Callback for errors
     */
    const init = (onTranscript, onError) => {
        if (!isSupported()) {
            console.warn('Web Speech API not supported in this browser');
            return false;
        }

        onTranscriptCallback = onTranscript;
        onErrorCallback = onError;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();

        // Configure recognition - continuous mode to avoid beeping
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        // Handle results
        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            // Only process results from resultIndex onwards (new results only)
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    // Double-check we haven't processed this index
                    if (i > lastProcessedIndex) {
                        finalTranscript += transcript + ' ';
                        lastProcessedIndex = i;
                    }
                } else {
                    interimTranscript += transcript;
                }
            }

            // Only call callback if there's new content
            if (onTranscriptCallback && (finalTranscript || interimTranscript)) {
                onTranscriptCallback({
                    final: finalTranscript.trim(),
                    interim: interimTranscript.trim(),
                    isFinal: finalTranscript.length > 0
                });
            }
        };

        // Handle errors
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);

            if (event.error === 'no-speech') {
                // Don't notify user or restart, just let it continue listening
                return;
            } else if (event.error === 'audio-capture') {
                if (onErrorCallback) {
                    onErrorCallback('Microphone not available');
                }
                isRecording = false;
            } else if (event.error === 'not-allowed') {
                if (onErrorCallback) {
                    onErrorCallback(event.error);
                }
                isRecording = false;
            } else if (event.error !== 'aborted') {
                // Log other errors but don't stop recording
                console.warn('Non-critical speech error:', event.error);
            }
        };

        // Handle end - auto-restart if still recording
        recognition.onend = () => {
            if (isRecording) {
                setTimeout(() => {
                    if (isRecording) {
                        try {
                            recognition.start();
                        } catch (e) {
                            // Ignore if already running
                        }
                    }
                }, 100);
            }
        };

        return true;
    };

    /**
     * Start recording
     */
    const start = () => {
        if (!recognition) {
            console.error('Voice recognition not initialized');
            return;
        }

        try {
            isRecording = true;
            lastProcessedIndex = -1; // Reset the processed index
            recognition.start();
        } catch (error) {
            // Already started, ignore
            if (error.message && error.message.includes('already started')) {
                return;
            }
            console.error('Error starting recognition:', error);
        }
    };

    /**
     * Stop recording
     */
    const stop = () => {
        if (!recognition) return;

        isRecording = false;
        lastProcessedIndex = -1; // Reset on stop
        try {
            recognition.stop();
        } catch (error) {
            console.error('Error stopping recognition:', error);
        }
    };

    /**
     * Check if currently recording
     * @returns {boolean}
     */
    const getIsRecording = () => isRecording;

    // Public API
    return {
        isSupported,
        init,
        start,
        stop,
        getIsRecording
    };
})();
