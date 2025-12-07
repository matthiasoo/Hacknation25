import 'dotenv/config';

export default {
  expo: {
    name: "BydgoszczGO!",
    slug: "mobile-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      // Dodano opisy uprawnień dla iOS (dobra praktyka, żeby buildy iOS nie ostrzegały)
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Aplikacja potrzebuje Twojej lokalizacji, aby pokazać ciekawe miejsca w pobliżu.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "Aplikacja potrzebuje lokalizacji w tle, aby powiadomić Cię o atrakcjach.",
        NSLocationAlwaysUsageDescription: "Aplikacja śledzi lokalizację w tle dla powiadomień.",
        UIBackgroundModes: ["location", "fetch"]
      },
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.hacknation25.mobileapp",
      // --- SEKCJA UPRAWNIEŃ (WAŻNE) ---
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "FOREGROUND_SERVICE",
        "FOREGROUND_SERVICE_LOCATION", // Wymagane dla Android 14+
        "POST_NOTIFICATIONS",          // Wymagane dla Android 13+
        "VIBRATE",
        "RECEIVE_BOOT_COMPLETED"       // Opcjonalne: pozwala wstawać usłudze po restarcie telefonu
      ],
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    // --- SEKCJA PLUGINÓW (WAŻNE) ---
    plugins: [
      "expo-secure-store",
      "expo-notifications", // Dodane, bo używasz powiadomień
      [
        "expo-location",
        {
          "isAndroidBackgroundLocationEnabled": true, // To dodaje usługę tła do Manifestu
          "isAndroidForegroundServiceEnabled": true   // To pozwala na stałe powiadomienie "BydgoszczGO!"
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "65e16949-16f9-4a9d-977e-9c0dca116468"
      }
    }
  }
};