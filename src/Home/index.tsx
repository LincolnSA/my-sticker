import { useState, useEffect, useRef } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  Alert,
} from "react-native";
import { captureRef } from "react-native-view-shot";
import { Camera, CameraType } from "expo-camera";
import * as Sharing from "expo-sharing";

import { PositionChoice } from "../components/PositionChoice";
import { Header } from "../components/Header";
import { Button } from "../components/Button";

import { styles } from "./styles";

import { POSITIONS, PositionProps } from "../utils/positions";

export function Home() {
  const [positionSelected, setPositionSelected] = useState<PositionProps>(
    POSITIONS[0]
  );
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [name, setName] = useState<string>("");

  const cameraRef = useRef<Camera>(null);
  const screenshotRef = useRef(null);

  useEffect(() => {
    handleGetPermission();
  }, []);

  async function handleGetPermission() {
    const permission = await Camera.requestCameraPermissionsAsync();

    if (!permission.granted) return handleTryGetPermission();

    setHasCameraPermission(permission.granted);
  }

  async function handleTryGetPermission() {
    Alert.alert(
      "Permissão",
      "Para continuar com o app, precisamos de sua permissão para utilizar a câmera.",
      [
        {
          text: "Cancelar",
          onPress: () => {},
          style: "cancel",
        },
        { text: "Confirmar", onPress: () => handleGetPermission() },
      ]
    );
  }

  async function handleTakePicture() {
    if (!name.length) {
      Alert.alert("Compartilhar", "Necessário preencher os campos");
      return;
    }

    if (!hasCameraPermission) return;

    const photo = await cameraRef.current.takePictureAsync();

    setPhotoUri(photo.uri);
  }

  async function handleShareScreenshot() {
    const screenshot = await captureRef(screenshotRef);

    await Sharing.shareAsync("file://" + screenshot);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sticker} ref={screenshotRef}>
          <Header position={positionSelected} />

          <View style={styles.picture}>
            {hasCameraPermission && !photoUri ? (
              <Camera
                style={styles.camera}
                ref={cameraRef}
                type={CameraType.front}
              />
            ) : (
              <Image
                style={styles.camera}
                source={{
                  uri: photoUri
                    ? photoUri
                    : "https://filestore.community.support.microsoft.com/api/images/490b996b-e45f-4985-b2af-cf36da33849a?upload=true",
                }}
                onLoad={handleShareScreenshot}
              />
            )}
            <View style={styles.player}>
              <TextInput
                style={styles.name}
                placeholder="Digite seu nome aqui"
                onChangeText={setName}
              />
            </View>
          </View>
        </View>

        <PositionChoice
          onChangePosition={setPositionSelected}
          positionSelected={positionSelected}
        />

        <TouchableOpacity onPress={() => setPhotoUri(null)}>
          <Text style={styles.retry}>Nova foto</Text>
        </TouchableOpacity>

        <Button title="Compartilhar" onPress={handleTakePicture} />
      </ScrollView>
    </SafeAreaView>
  );
}
