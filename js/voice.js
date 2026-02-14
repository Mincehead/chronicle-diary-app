/**
 * Voice Module - Web Speech API Integration
 * Handles voice-to-text functionality
 */

const VoiceRecorder = (() => {
    let recognition = null;
    let isRecording = false;
    let onTranscriptCallback = null;
    let onErrorCallback = null;

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

        // Configure recognition
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        // Handle results
        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            // Only process new results from the last resultIndex
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            // Only call callback if there's actually new content
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
                // Automatically restart on no-speech
                if (isRecording) {
                    setTimeout(() => {
                        if (isRecording) start();
                    }, 100);
                }
            } else {
                if (onErrorCallback) {
                    onErrorCallback(event.error);
                }
            }
        };

        // Handle end
        recognition.onend = () => {
            // Auto-restart if still recording
            if (isRecording) {
                setTimeout(() => {
                    if (isRecording) start();
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
            recognition.start();
        } catch (error) {
            // Already started, ignore
            if (error.message.includes('already started')) {
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
