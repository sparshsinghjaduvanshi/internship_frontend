"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { socket } from "@/lib/socket";

const servers = {
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302",
        },
    ],
};

export default function CallPage() {
    const router = useRouter();
    const { roomId } = router.query;

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStream = useRef<MediaStream | null>(null);

    const screenTrackRef = useRef<MediaStreamTrack | null>(null);
    const cameraTrackRef = useRef<MediaStreamTrack | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    const [isSharingScreen, setIsSharingScreen] = useState(false);

    const [isRecording, setIsRecording] = useState(false);




    useEffect(() => {
        if (!roomId) return;

        startCall();

        async function startCall() {
            peerConnection.current = new RTCPeerConnection(servers);

            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            localStream.current = stream;
            cameraTrackRef.current = stream.getVideoTracks()[0];


            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            stream.getTracks().forEach((track) => {
                peerConnection.current?.addTrack(track, stream);
            });

            // peerConnection.current.ontrack = (event) => {
            //     const remoteStream = event.streams[0];

            //     if (remoteVideoRef.current) {
            //         remoteVideoRef.current.srcObject = remoteStream;
            //     }
            // };

            peerConnection.current.ontrack = (event) => {
                console.log("Remote track received");

                const [remoteStream] = event.streams;

                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                }
            };

            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("ice-candidate", {
                        roomId,
                        candidate: event.candidate,
                    });
                    console.log("Sending ICE candidate");
                }
            };

            if (!socket.connected) {
                socket.connect();
            }
            socket.emit("join-room", roomId);

            socket.on("create-offer", async () => {
                console.log("Creating offer");
                const offer = await peerConnection.current?.createOffer();

                await peerConnection.current?.setLocalDescription(
                    offer!);

                socket.emit("offer", {
                    roomId,
                    offer,
                });
            });

            socket.on("offer", async (offer) => {
                console.log("Offer received");
                await peerConnection.current?.setRemoteDescription(
                    new RTCSessionDescription(offer)
                );

                const answer = await peerConnection.current?.createAnswer();

                await peerConnection.current?.setLocalDescription(
                    answer!
                );

                socket.emit("answer", {
                    roomId,
                    answer,
                });
            });

            socket.on("answer", async (answer) => {
                console.log("Answer received");
                await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(answer));
            });

            socket.on("ice-candidate", async (candidate) => {
                try {
                    console.log("ICE candidate received");
                    await peerConnection.current?.addIceCandidate(
                        new RTCIceCandidate(candidate)
                    );
                } catch (err) {
                    console.error(err);
                }
            });
        }

        return () => {
            socket.off("create-offer");
            socket.off("offer");
            socket.off("answer");
            socket.off("ice-candidate");

            peerConnection.current?.close();

            localStream.current
                ?.getTracks()
                .forEach((track) => track.stop());
        };
    }, [roomId]);

    const toggleMute = () => {
        const audioTrack = localStream.current
            ?.getAudioTracks()[0];


        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setIsMuted(!audioTrack.enabled);
        }


    };

    const toggleVideo = () => {
        const videoTrack = localStream.current
            ?.getVideoTracks()[0];


        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOff(!videoTrack.enabled);
        }


    };

    const endCall = () => {
        peerConnection.current?.close();


        localStream.current
            ?.getTracks()
            .forEach((track) => track.stop());

        socket.off("create-offer");
        socket.off("offer");
        socket.off("answer");
        socket.off("ice-candidate");

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }

        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }


    };

    // const shareScreen = async () => {
    //     try {
    //         const screenStream =
    //             await navigator.mediaDevices.getDisplayMedia({
    //                 video: true,
    //             });

    //         const screenTrack =
    //             screenStream.getVideoTracks()[0];

    //         screenTrackRef.current = screenTrack;
    //         const sender = peerConnection.current
    //             ?.getSenders()
    //             .find(
    //                 (sender) =>
    //                     sender.track?.kind === "video"
    //             );
    //         if (sender) {
    //             sender.replaceTrack(screenTrack);
    //         }

    //         // Show screen locally
    //         if (localVideoRef.current) {
    //             localVideoRef.current.srcObject =
    //                 screenStream;
    //         }
    //         setIsSharingScreen(true);

    //         // When user stops sharing manually
    //         screenTrack.onended = async () => {
    //             try {

    //                 // Get fresh camera stream
    //                 const cameraStream =
    //                     await navigator.mediaDevices.getUserMedia({
    //                         video: true,
    //                         audio: true,
    //                     });
    //                 const cameraTrack =
    //                     cameraStream.getVideoTracks()[0];

    //                 // Replace video track in peer connection
    //                 const sender = peerConnection.current
    //                     ?.getSenders()
    //                     .find(
    //                         (sender) =>
    //                             sender.track?.kind === "video"
    //                     );

    //                 if (sender) {
    //                     await sender.replaceTrack(cameraTrack);
    //                 }

    //                 // Stop old tracks
    //                 localStream.current
    //                     ?.getTracks()
    //                     .forEach((track) => {
    //                         if (track.kind === "video") {
    //                             track.stop();
    //                         }
    //                     });

    //                 // Update local stream
    //                 localStream.current = cameraStream;

    //                 // Restore local preview
    //                 if (localVideoRef.current) {
    //                     localVideoRef.current.srcObject =
    //                         cameraStream;

    //                     await localVideoRef.current.play();
    //                 }

    //                 setIsSharingScreen(false);

    //                 console.log("Screen sharing stopped");

    //             } catch (error) {
    //                 console.error(error);
    //             }


    //         };

    //     } catch (error) {
    //         console.error(error);
    //     }


    // };

    const shareScreen = async () => {
        try {
            const screenStream =
                await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                });

            const screenTrack = screenStream.getVideoTracks()[0];
            screenTrackRef.current = screenTrack;
            const sender = peerConnection.current
                ?.getSenders()
                .find(
                    (sender) =>
                        sender.track?.kind === "video"
                );

            // Replace webcam with screen
            if (sender) {
                await sender.replaceTrack(screenTrack);
            }

            // Show screen locally
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = screenStream;

                await localVideoRef.current.play();
            }

            setIsSharingScreen(true);

            // When sharing stops
            screenTrack.onended = async () => {
                try {
                    const sender = peerConnection.current
                        ?.getSenders()
                        .find(
                            (sender) => sender.track?.kind === "video"
                        );

                    // Restore ORIGINAL camera track
                    if (sender && cameraTrackRef.current) {
                        await sender.replaceTrack(cameraTrackRef.current);
                    }

                    // Restore original stream locally
                    if (localVideoRef.current && localStream.current) {

                        localVideoRef.current.srcObject = localStream.current;
                        await localVideoRef.current.play();
                    }

                    setIsSharingScreen(false);

                    console.log("Camera restored successfully");

                } catch (error) {
                    console.error(error);
                }
            };
        } catch (error) {
            console.error(error);
        }
    };

    const stopScreenShare = async () => {
        screenTrackRef.current?.stop();
    };

    const startRecording = () => {


        if (!localStream.current) return;

        recordedChunksRef.current = [];
        const mediaRecorder = new MediaRecorder(
            localStream.current,
            {
                mimeType: "video/webm",
            }
        );
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(
                recordedChunksRef.current,
                {
                    type: "video/webm",
                }
            );

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `recording-${Date.now()}.webm`;
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            document.body.removeChild(a);
        };

        mediaRecorder.start();
        setIsRecording(true);
        console.log("Recording started");
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        console.log("Recording stopped");
    };

    // return (
    //     <div className="min-h-screen bg-black p-4">
    //         <h1 className="text-white text-2xl mb-4">
    //             Room: {roomId}
    //         </h1>

    //         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //             <video
    //                 ref={localVideoRef}
    //                 autoPlay
    //                 muted
    //                 playsInline
    //                 className="w-full rounded-lg bg-gray-900"
    //             />

    //             <video
    //                 ref={remoteVideoRef}
    //                 autoPlay
    //                 playsInline
    //                 className="w-full rounded-lg bg-gray-900"
    //             />
    //         </div>

    //         <div className="flex justify-center gap-4 mt-6">


    //             <button
    //                 onClick={toggleMute}
    //                 className="bg-yellow-500 px-4 py-2 rounded text-white">
    //                 {isMuted ? "Unmute" : "Mute"}
    //             </button>

    //             <button
    //                 onClick={toggleVideo}
    //                 className="bg-blue-500 px-4 py-2 rounded text-white">
    //                 {isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
    //             </button>

    //             <button
    //                 onClick={endCall}
    //                 className="bg-red-500 px-4 py-2 rounded text-white">
    //                 End Call
    //             </button>

    //             <button
    //                 onClick={
    //                     isSharingScreen
    //                         ? stopScreenShare
    //                         : shareScreen
    //                 }
    //                 className="bg-green-600 px-4 py-2 rounded text-white">
    //                 {isSharingScreen
    //                     ? "Stop Sharing"
    //                     : "Share Screen"}
    //             </button>

    //             <button
    //                 onClick={
    //                     isRecording
    //                         ? stopRecording
    //                         : startRecording
    //                 }
    //                 className="bg-purple-600 px-4 py-2 rounded text-white">
    //                 {isRecording
    //                     ? "Stop Recording"
    //                     : "Start Recording"}
    //             </button>



    //         </div>

    //     </div>
    // );

    return (<div className="h-screen w-full bg-black relative overflow-hidden">

        {/* Remote Video */}
        <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover bg-black" />

        {/* Local Video Overlay */}
        <div className="absolute top-4 right-4 w-28 sm:w-40 md:w-52 lg:w-64 rounded-2xl overflow-hidden border border-gray-700 shadow-2xl bg-gray-900 " >

            <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover" />

        </div>

        {/* Top Room Label */}
        <div className="absolute top-4 left-4 bg-black/60 px-4 py-2 rounded-xl text-white backdrop-blur-sm">
            Room: {roomId}
        </div>

        {/* Bottom Controls */}
        <div className=" absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-wrap justify-center items-center gap-3 bg-black/70 px-4 py-3 rounded-2xl backdrop-blur-md shadow-2xl w-[95%] max-w-4xl " >
            {/* Mute */}
            <button
                onClick={toggleMute}
                className="bg-yellow-500 hover:bg-yellow-600 transition px-4 sm:px-5 py-2 sm:py-3 text-sm sm:text-base rounded-full text-white font-medium">
                {isMuted ? "Unmute" : "Mute"}
            </button>

            {/* Camera */}
            <button
                onClick={toggleVideo}
                className="bg-blue-500 hover:bg-blue-600 transition px-4 sm:px-5 py-2 sm:py-3 text-sm sm:text-base rounded-full text-white font-medium">
                {isVideoOff
                    ? "Camera On"
                    : "Camera Off"}
            </button>

            {/* Screen Share */}
            <button
                onClick={
                    isSharingScreen
                        ? stopScreenShare
                        : shareScreen
                }
                className="bg-green-600 hover:bg-green-700 transition px-4 sm:px-5 py-2 sm:py-3 text-sm sm:text-base rounded-full text-white font-medium">
                {isSharingScreen
                    ? "Stop Share"
                    : "Share Screen"}
            </button>

            {/* Recording */}
            <button
                onClick={
                    isRecording
                        ? stopRecording
                        : startRecording
                }
                className="bg-purple-600 hover:bg-purple-700 transition px-4 sm:px-5 py-2 sm:py-3 text-sm sm:text-base rounded-full text-white font-medium">
                {isRecording
                    ? "Stop Recording"
                    : "Record"}
            </button>

            {/* End Call */}
            <button
                onClick={endCall}
                className="bg-red-600 hover:bg-red-700 transition px-4 sm:px-5 py-2 sm:py-3 text-sm sm:text-base rounded-full text-white font-medium">
                End
            </button>
        </div>
    </div>
    );
}