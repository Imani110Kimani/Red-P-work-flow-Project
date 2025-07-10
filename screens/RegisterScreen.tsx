// This file has been removed as per user request.
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.login}>
        <Text style={styles.loginText}>Already have an account? Sign in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff7f0', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 24 },
  row: { flexDirection: 'row', width: '100%', marginBottom: 16 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
  upload: { backgroundColor: '#eee', borderRadius: 8, padding: 12, width: '100%', alignItems: 'center', marginBottom: 8 },
  uploadText: { color: '#f60', fontWeight: '500' },
  imagePreview: { width: 100, height: 60, marginBottom: 16, borderRadius: 8 },
  button: { backgroundColor: '#f60', borderRadius: 8, paddingVertical: 14, width: '100%', alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  login: { marginTop: 8 },
  loginText: { color: '#333', fontSize: 14 },
  logoContainer: { width: '100%', alignItems: 'center', marginBottom: 12, position: 'relative' },
  logo: { width: 80, height: 80, borderRadius: 20, marginBottom: 4, backgroundColor: 'rgba(255,122,0,0.08)', borderWidth: 1, borderColor: '#eee', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 2, opacity: 0.85 },
});
