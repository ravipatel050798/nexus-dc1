import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("from 'framer-motion';", "from 'framer-motion';\nimport Login from './components/Login';\nimport { useAuth } from './contexts/AuthContext';")
content = content.replace("const App = () => {", "const AppContent = () => {\n    const { logout } = useAuth();")
content = content.replace("        </div>\n    );\n};\n\nexport default App;", "        </div>\n    );\n};\n\nconst App = () => {\n    const { isAuthenticated } = useAuth();\n    return isAuthenticated ? <AppContent /> : <Login />;\n};\n\nexport default App;")

with open('src/App.tsx', 'w') as f:
    f.write(content)
