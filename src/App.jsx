import React, { useEffect, useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useDropzone } from 'react-dropzone';
import { generateClient } from 'aws-amplify/data';

const client = generateClient();

function App() {
  const [todos, setTodos] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);

  // Retrieve image from sessionStorage when the app loads
  useEffect(() => {
    const savedImageUrl = sessionStorage.getItem('uploadedImage');
    if (savedImageUrl) {
      setImageUrl(savedImageUrl);
    }

    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Todo.create({ content: window.prompt('Todo content') });
  }

  function deleteTodo(id) {
    client.models.Todo.delete({ id });
  }

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        const result = reader.result;
        setImageUrl(result);

        // Store the image in sessionStorage
        sessionStorage.setItem('uploadedImage', result);
      };

      if (file) {
        reader.readAsDataURL(file);
      }
    },
  });

  return (
    <Authenticator>
      {({ signOut }) => (
        <main>
          <div className="profile-image-container">
            {imageUrl && <img src={imageUrl} alt="Profile" className="profile-image" />}
          </div>
          <h1>My todos</h1>
          <button onClick={createTodo}>+ new</button>
          <ul>
            {todos.map((todo) => (
              <li key={todo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {todo.content}
                <i 
                  className="fas fa-trash" 
                  style={{ color: 'gray', cursor: 'pointer' }} 
                  onClick={() => deleteTodo(todo.id)}
                ></i>
              </li>
            ))}
          </ul>

          {/* Dropzone */}
          <div {...getRootProps({ className: 'dropzone' })}>
            <input {...getInputProps()} />
            <p>Drag 'n' drop some files here, or click to select files</p>
          </div>

          <button onClick={signOut}>Sign out</button>
        </main>
      )}
    </Authenticator>
  );
}

export default App;
