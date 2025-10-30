import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line
  }, []);

  const fetchSettings = async () => {
    setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/api/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(res.data);
    } catch {
      setError('Error loading settings');
    }
  };

  const updateSettings = async () => {
    setSaving(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      await axios.put('/api/settings', settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSaving(false);
      alert('Settings updated!');
    } catch {
      setError('Error saving settings');
      setSaving(false);
    }
  };

  const handleInput = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleCategoryInput = (type, idx, value) => {
    const cats = [ ...settings.categories[type] ];
    cats[idx] = value;
    setSettings({
      ...settings,
      categories: { ...settings.categories, [type]: cats }
    });
  };

  const addCategory = (type) => {
    setSettings({
      ...settings,
      categories: { ...settings.categories, [type]: [ ...settings.categories[type], '' ] }
    });
  };

  const handleDeleteCategory = (type, idx) => {
    const cats = [ ...settings.categories[type] ];
    cats.splice(idx, 1);
    setSettings({
      ...settings,
      categories: { ...settings.categories, [type]: cats }
    });
  };

  const handleArrayInput = (field, idx, value) => {
    const arr = [ ...settings[field] ];
    arr[idx] = value;
    setSettings({ ...settings, [field]: arr });
  };

  const addArrayItem = (field) => {
    setSettings({ ...settings, [field]: [ ...settings[field], '' ] });
  };

  const deleteArrayItem = (field, idx) => {
    const arr = [ ...settings[field] ];
    arr.splice(idx, 1);
    setSettings({ ...settings, [field]: arr });
  };

  if (!settings)
    return <Layout title="Settings">{error ? <div style={{ color: "#ff4d4f" }}>{error}</div> : <p>Loading...</p>}</Layout>;

  return (
    <Layout title="Settings">
      {error && <div style={{ color: "#ff4d4f", marginBottom: 10 }}>{error}</div>}
      <form onSubmit={e => { e.preventDefault(); updateSettings(); }}>
        <div style={{ marginBottom: 16 }}>
          <label>Nursery Name</label><br/>
          <input name="nurseryName" value={settings.nurseryName}
            onChange={handleInput} style={{ width: 300, padding: 8 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Currency</label><br/>
          <input name="currency" value={settings.currency}
            onChange={handleInput} style={{ width: 100, padding: 8 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Timezone</label><br/>
          <input name="timezone" value={settings.timezone}
            onChange={handleInput} style={{ width: 200, padding: 8 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Income Categories</label><br/>
          {settings.categories.income.map((cat, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input value={cat} onChange={e => handleCategoryInput('income', idx, e.target.value)}
                style={{ padding: 6 }} />
              <button type="button" onClick={() => handleDeleteCategory('income', idx)} style={{ color: "red" }}>Delete</button>
            </div>
          ))}
          <button type="button" onClick={() => addCategory('income')} style={{ marginTop: 8 }}>Add Income Category</button>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Expense Categories</label><br/>
          {settings.categories.expense.map((cat, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input value={cat} onChange={e => handleCategoryInput('expense', idx, e.target.value)}
                style={{ padding: 6 }} />
              <button type="button" onClick={() => handleDeleteCategory('expense', idx)} style={{ color: "red" }}>Delete</button>
            </div>
          ))}
          <button type="button" onClick={() => addCategory('expense')} style={{ marginTop: 8 }}>Add Expense Category</button>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Payment Methods</label><br/>
          {settings.paymentMethods.map((val, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input value={val} onChange={e => handleArrayInput('paymentMethods', idx, e.target.value)}
                style={{ padding: 6 }} />
              <button type="button" onClick={() => deleteArrayItem('paymentMethods', idx)} style={{ color: "red" }}>Delete</button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem('paymentMethods')} style={{ marginTop: 8 }}>Add Payment Method</button>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label>Classes</label><br/>
          {settings.classes.map((val, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input value={val} onChange={e => handleArrayInput('classes', idx, e.target.value)}
                style={{ padding: 6 }} />
              <button type="button" onClick={() => deleteArrayItem('classes', idx)} style={{ color: "red" }}>Delete</button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem('classes')} style={{ marginTop: 8 }}>Add Class</button>
        </div>
        <button type="submit" disabled={saving}
          style={{ background: "#1890ff", color: "white", padding: "10px 28px", border: "none", borderRadius: 4 }}>
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </Layout>
  );
}
