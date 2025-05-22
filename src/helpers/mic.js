let socket;

function resampleTo16kHZ(audioData, origSampleRate = 44100) {
  // Convert the audio data to a Float32Array
  const data = new Float32Array(audioData);

  // Calculate the desired length of the resampled data
  const targetLength = Math.round(data.length * (16000 / origSampleRate));

  // Create a new Float32Array for the resampled data
  const resampledData = new Float32Array(targetLength);

  // Calculate the spring factor and initialize the first and last values
  const springFactor = (data.length - 1) / (targetLength - 1);
  resampledData[0] = data[0];
  resampledData[targetLength - 1] = data[data.length - 1];

  // Resample the audio data
  for (let i = 1; i < targetLength - 1; i++) {
    const index = i * springFactor;
    const leftIndex = Math.floor(index).toFixed();
    const rightIndex = Math.ceil(index).toFixed();
    const fraction = index - leftIndex;
    resampledData[i] = data[leftIndex] + (data[rightIndex] - data[leftIndex]) * fraction;
  }

  // Return the resampled data
  return resampledData;
}


async function requestUserMediaAudioStream(config) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {...config, channelCount: 1},
  });
  console.debug(
    '[requestUserMediaAudioStream] stream created with settings:',
    stream.getAudioTracks()?.[0]?.getSettings(),
  );
  return stream;
}


function getRecorder(stream) {
  const audioCtx = new AudioContext();

  const mediaStream = audioCtx.createMediaStreamSource(stream);
  const recorder = audioCtx.createScriptProcessor(8192, 1, 1);

  recorder.onaudioprocess = async (event) => {

    const inputData = event.inputBuffer.getChannelData(0);
    const audioData16kHz = resampleTo16kHZ(inputData, audioCtx.sampleRate);

    socket.send(audioData16kHz);
  };
  mediaStream.connect(recorder);

  recorder.connect(audioCtx.destination);
}

async function startStreaming() {
  const audioContext = new AudioContext();
  if (audioContext.state === 'suspended') {
    console.warn('audioContext was suspended! resuming...');
    await audioContext.resume();
  }

  let stream = null;

  try {
    stream = await requestUserMediaAudioStream({
      noiseSuppression: false,
      echoCancellation: false
    });


  } catch (e) {
    console.error('[startStreaming] media stream request failed:', e);
    return;
  }


  const recorder = getRecorder(stream)
  /*const recorder = new MediaRecorder(stream);

  recorder.ondataavailable = async ({data}) => {

          console.log(data)
       //   const audioBlob = new Blob([data], { type: 'audio/wav' });
          const arrayBuffer = await new Response(data).arrayBuffer();
          console.log(arrayBuffer)
          const abuffer = await audioCtx.decodeAudioData(arrayBuffer);
          const pcm16Audio = float32To16BitPCM(new Float32Array(abuffer));
          console.log(pcm16Audio);
        //  socket.emit('incoming_audio', pcm16Audio);
  }*/
  // recorder.startRecording();
}

const option = {
        host: 'whisper.plavno.io',
        port: '41084',
}

function connectToWhisper() {

        socket = new WebSocket(`wss://${option.host}:${option.port}/`)
        socket.onopen = function (e) {
                socket.send(
                        JSON.stringify({
                                uid: 'tester',
                                language: 'en',
                                task: 'translate',
                              model:"large-v3",
                                use_vad: true
                        })
                );
        };

        socket.onmessage = async (event) => {
          const outputElement = document.getElementById('ouputDiv');
                const data = JSON.parse(event.data);
                if(data){
                  console.log()
                  const resultrss = data.segments.map(item => item.text);
                  outputElement.innerText = resultrss.join('\n');
                }

                // console.log(data.segments.join('<br/>'));

        }
}
connectToWhisper()
