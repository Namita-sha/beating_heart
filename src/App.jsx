import HeartCanvas from './HeartCanvas'

function App() {
  return (
    <div style={{
      background: '#000',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <HeartCanvas />
    </div>
  )
}

export default App