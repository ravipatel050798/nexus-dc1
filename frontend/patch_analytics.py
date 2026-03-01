import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add analytics state
content = content.replace("const [activeTab, setActiveTab] = useState('dashboard');", "const [activeTab, setActiveTab] = useState('dashboard');\n    const [analytics, setAnalytics] = useState<any[]>([]);")

# Add token and replace device fetch, add analytics fetch
old_fetch = """    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/devices');
                if (response.ok) {
                    const data = await response.json();
                    setFleet(data.map((d: any) => ({
                        id: d.id.toString(),
                        name: d.name,
                        battery: Math.round(d.battery),
                        signal: Math.round(d.signal),
                        location: d.location,
                        status: Math.round(d.battery) < 20 ? 'Critical' : (Math.round(d.battery) < 50 ? 'Warning' : 'Healthy'),
                        lastSeen: '13 days ago',
                        ip: d.ip_address
                    })));
                }
            } catch (error) {
                console.error("Fetch error:", error);
            }
        };
        fetchDevices();
        const interval = setInterval(fetchDevices, 5000);
        return () => clearInterval(interval);
    }, []);"""

new_fetch = """    const { token } = useAuth();
    
    useEffect(() => {
        const fetchDevices = async () => {
            if (!token) return;
            try {
                const response = await fetch('http://localhost:8000/api/devices', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.status === 401) { logout(); return; }
                if (response.ok) {
                    const data = await response.json();
                    setFleet(data.map((d: any) => ({
                        id: d.id.toString(),
                        name: d.name,
                        battery: Math.round(d.battery),
                        signal: Math.round(d.signal),
                        location: d.location,
                        status: Math.round(d.battery) < 20 ? 'Critical' : (Math.round(d.battery) < 50 ? 'Warning' : 'Healthy'),
                        lastSeen: '13 days ago',
                        ip: d.ip_address
                    })));
                }
            } catch (error) {
                console.error("Fetch error:", error);
            }
        };
        fetchDevices();
        const interval = setInterval(fetchDevices, 5000);
        return () => clearInterval(interval);
    }, [token, logout]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!token || activeTab !== 'analytics') return;
            try {
                const response = await fetch('http://localhost:8000/api/analytics', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.status === 401) { logout(); return; }
                if (response.ok) {
                    const data = await response.json();
                    setAnalytics(data);
                }
            } catch (error) {
                console.error("Fetch analytics error:", error);
            }
        };
        fetchAnalytics();
        const interval = setInterval(fetchAnalytics, 5000);
        return () => clearInterval(interval);
    }, [activeTab, token, logout]);"""

content = content.replace(old_fetch, new_fetch)

# Replace chart data inputs
content = content.replace("<BarChart data={generateChartData()}>", "<BarChart data={analytics}>")
content = content.replace("<AreaChart data={generateChartData()}>", "<AreaChart data={analytics}>")

with open('src/App.tsx', 'w') as f:
    f.write(content)
