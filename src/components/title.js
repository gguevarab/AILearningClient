import React from 'react'

const Title = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
    <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Generador de Material</h1>
    <input 
      type="text" 
      placeholder="Tipo de material de estudio" 
      style={{
        padding: '10px', 
        width: '300px', 
        borderRadius: '4px', 
        border: '1px solid #ccc',
        fontSize: '16px'
      }}
    />
  </div>
  )
}

export default Title