
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useData();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      updateSettings(localSettings);
      setIsSaving(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-stone-800 tracking-tight">Configurações do Sistema</h1>
          <p className="text-stone-500">Gerencie dados do site, métodos de pagamentos e integrações externas.</p>
        </div>
        {showSaved && (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 animate-bounce">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Alterações salvas!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 max-w-5xl">
        {/* Integração Google Sheets */}
        <section className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 bg-green-500/5 blur-3xl rounded-full"></div>
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-green-600">table_chart</span>
              <h3 className="font-bold">Integração Google Sheets</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={localSettings.isSheetsEnabled}
                onChange={(e) => setLocalSettings({ ...localSettings, isSheetsEnabled: e.target.checked })}
              />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">URL do Webhook (Google Apps Script)</label>
              <input
                className="w-full p-4 bg-stone-50 border-none rounded-xl focus:ring-2 focus:ring-green-500/20 outline-none font-mono text-xs"
                placeholder="https://script.google.com/macros/s/XXXXX/exec"
                value={localSettings.googleSheetsWebhookUrl}
                onChange={(e) => setLocalSettings({ ...localSettings, googleSheetsWebhookUrl: e.target.value })}
              />
              <p className="text-[10px] text-stone-400">
                Sempre que uma venda for realizada, os dados serão enviados para esta URL automaticamente.
              </p>
            </div>
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex items-start gap-3">
              <span className="material-symbols-outlined text-stone-400">info</span>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                <b>Como configurar:</b> Vá ao Google Sheets &gt; Extensões &gt; Apps Script. Cole o código do receptor e publique como "Aplicativo Web" com acesso para "Qualquer pessoa". Copie a URL gerada e cole acima.
              </p>
            </div>

            {/* Script Code Helper */}
            <div className="pt-2">
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-xs font-bold text-rhema-primary hover:text-rhema-primary/80 transition-colors select-none">
                  <span className="material-symbols-outlined text-lg transition-transform group-open:rotate-90">chevron_right</span>
                  Ver código do script para copiar
                </summary>
                <div className="mt-4 p-4 bg-stone-900 rounded-xl overflow-hidden relative group/code">
                  <button
                    onClick={() => {
                      const code = `
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["ID", "Cliente", "Email", "Telefone", "Valor", "Status", "Data", "Itens"]);
  }
  
  sheet.appendRow([
    data.id,
    data.customerName,
    data.customerEmail,
    data.customerPhone,
    data.amount,
    data.status,
    new Date(data.date).toLocaleString(),
    data.items.map(function(i) { return i.title + " (x" + i.quantity + ")"; }).join(", ")
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({"result":"success"})).setMimeType(ContentService.MimeType.JSON);
}`.trim();
                      navigator.clipboard.writeText(code);
                      alert('Código copiado!');
                    }}
                    className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                    title="Copiar Código"
                  >
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                  </button>
                  <pre className="text-[10px] text-stone-300 font-mono overflow-x-auto whitespace-pre-wrap">
                    {`function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  // Cria cabeçalho se a planilha estiver vazia
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["ID", "Cliente", "Email", "Telefone", "Valor", "Status", "Data", "Itens"]);
  }
  
  sheet.appendRow([
    data.id,
    data.customerName,
    data.customerEmail,
    data.customerPhone,
    data.amount,
    data.status,
    new Date(data.date).toLocaleString(),
    data.items.map(function(i) { return i.title + " (x" + i.quantity + ")"; }).join(", ")
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({"result":"success"}))
    .setMimeType(ContentService.MimeType.JSON);
}`}
                  </pre>
                </div>
              </details>
            </div>
          </div>
        </section>

        {/* Dados do Site */}
        <section className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm space-y-8">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <span className="material-symbols-outlined text-rhema-primary">storefront</span>
            <h3 className="font-bold">Dados de Contato</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">E-mail de Suporte</label>
              <input
                className="w-full p-4 bg-stone-50 border-none rounded-xl focus:ring-2 focus:ring-rhema-primary/20 outline-none"
                value={localSettings.supportEmail}
                onChange={(e) => setLocalSettings({ ...localSettings, supportEmail: e.target.value })}
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-4 pt-4">
          <button
            onClick={() => setLocalSettings(settings)}
            className="px-8 py-4 bg-white border border-stone-200 text-stone-600 font-bold rounded-2xl hover:bg-stone-50 transition-colors"
          >
            Descartar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-4 bg-rhema-primary text-white font-bold rounded-2xl shadow-xl shadow-rhema-primary/20 hover:brightness-110 transition-all flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
