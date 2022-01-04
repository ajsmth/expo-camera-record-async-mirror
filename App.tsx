import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Button } from "react-native";
import { Camera } from "expo-camera";
import { Video } from "expo-av";

import { StackContainer, Stack } from "react-native-async-stack";

export default function App() {
  return (
    <StackContainer stack={Stack}>
      <CameraScreen />
    </StackContainer>
  );
}

function CameraScreen() {
  const [hasPermissions, setHasPermission] = React.useState(false);
  const camera = React.useRef<Camera>(null);
  const [isRecording, setIsRecording] = React.useState(false);

  function onRecordingPress() {
    if (isRecording) {
      camera.current.stopRecording();
    } else {
      camera.current
        .recordAsync({
          quality: Camera.Constants.VideoQuality["1080p"],
          mirror: true,
          maxDuration: 10,
        })
        .then((recording) => {
          Stack.push({
            element: <RecordingScreen uri={recording.uri} />,
            headerProps: {
              title: "Latest Recording",
            },
          });
          setIsRecording(false);
        });
      setIsRecording(true);
    }
  }

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  if (!hasPermissions) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={Camera.Constants.Type.front}
        ref={camera}
      />

      <View style={styles.controls}>
        <Button
          title={isRecording ? "Stop recording" : "Start recording"}
          onPress={onRecordingPress}
        />
      </View>
    </View>
  );
}

function RecordingScreen({ uri }) {
  const video = React.useRef<Video>(null);
  const [status, setStatus] = React.useState<any>({});

  return (
    <View style={styles.container}>
      <Video
        ref={video}
        style={styles.video}
        source={{
          uri,
        }}
        useNativeControls
        resizeMode="contain"
        isLooping
        onPlaybackStatusUpdate={(status) => setStatus(() => status)}
      />
      <View style={styles.controls}>
        <Button
          title={status.isPlaying ? "Pause" : "Play"}
          onPress={() => {
            if (status.isPlaying) {
              video.current.pauseAsync();
            } else {
              video.current.playAsync();
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },

  camera: {
    flex: 1,
  },

  video: {
    flex: 1,
  },

  text: {
    fontSize: 18,
    color: "white",
  },

  controls: {
    height: 64,
    marginBottom: 50,
    justifyContent: "center",
  },
});
