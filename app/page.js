"use client";

import React, { useState, useEffect } from 'react';

// --- [OPTIMASI] Komponen terpisah untuk setiap item lomba ---
const CompetitionItem = ({ title, icon, lombaKey, data, toggleCompetition, children }) => {
  return (
    <div className="competition-item">
      <div className="competition-header">
        <div className="competition-title">
          <span className="competition-icon">{icon}</span> {title}
        </div>
        <div className="participation-choice">
          <button type="button" onClick={() => toggleCompetition(lombaKey, false)} className={`choice-btn ${!data.ikut ? 'active' : ''}`}>Tidak Ikut</button>
          <button type="button" onClick={() => toggleCompetition(lombaKey, true)} className={`choice-btn ${data.ikut ? 'active' : ''}`}>Ikut Misi</button>
        </div>
      </div>
      <div className={`competition-details ${data.ikut ? 'show' : ''}`}>
        {children}
      </div>
    </div>
  );
};

// --- [OPTIMASI] Komponen terpisah untuk Modal Notifikasi ---
const Modal = ({ message, onClose }) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!message) return null;

  const isError = message.toLowerCase().startsWith('error');
  const successIcon = "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z";
  const errorIcon = "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-body">
          <div className={`modal-icon ${isError ? 'error' : 'success'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d={isError ? errorIcon : successIcon}></path>
            </svg>
          </div>
          <h3 className="modal-title">{isError ? 'Terjadi Kesalahan' : 'Pendaftaran Berhasil'}</h3>
          <p className="modal-text">{isError ? message.replace('Error: ', '') : message}</p>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-primary">Mengerti</button>
        </div>
      </div>
    </div>
  );
};

// --- State awal (kosong) untuk formulir kita ---
const initialFormData = {
  nama: '',
  kelas: '',
  wa: '',
  lomba: {
    tiupGelas: { ikut: false, nama: '' },
    paku: { ikut: false, peserta: ['', '', '', ''] },
    tambangPutra: { ikut: false, peserta: ['', '', '', '', '', ''] },
    tambangPutri: { ikut: false, peserta: ['', '', '', '', '', ''] },
    kerupuk: { ikut: false, nama: '' },
  },
};

// --- Daftar kelas untuk dropdown ---
const daftarKelas = [
  "10 PPLG", "10 MPLB", "10 DKV",
  "11 RPL", "11 MPLB", "11 DKV",
  "12 RPL", "12 OTKP", "12 MM 1", "12 MM 2"
];

// --- Komponen Utama ---
export default function FormPendaftaranLengkap() {
  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleMainChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleCompetition = (lomba, status) => {
    setFormData(prev => ({
      ...prev,
      lomba: { ...prev.lomba, [lomba]: { ...prev.lomba[lomba], ikut: status } },
    }));
  };

  const handleLombaChange = (lomba, value, index = null) => {
    setFormData(prev => {
      const newLombaData = { ...prev.lomba };
      if (index !== null) {
        const newPeserta = [...newLombaData[lomba].peserta];
        newPeserta[index] = value;
        newLombaData[lomba].peserta = newPeserta;
      } else {
        newLombaData[lomba].nama = value;
      }
      return { ...prev, lomba: newLombaData };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const waPattern = /^08\d{8,13}$/;
    if (!waPattern.test(formData.wa)) {
      setMessage('Error: Format Nomor WhatsApp tidak valid. Pastikan diawali "08".');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/daftar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Terjadi kesalahan.');
      setMessage('Data Anda telah berhasil terkirim! Sampai jumpa di medan pertempuran. MERDEKA!');
      setFormData(initialFormData);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal message={message} onClose={() => setMessage('')} />
      <div className="container">
        <div className="card">
          <div className="card-header">
            <div className="header-content">
              <h1 className="title-glow">GELORA KEMERDEKAAN</h1>
              <p className="subtitle-pulse">🎉 FORMULIR PENDAFTARAN LOMBA HUT RI 🎉</p>
              {/* --- [BARU] Tombol Peraturan --- */}
              <a 
                href="https://drive.google.com/drive/folders/1l4hpzBz-6bgXfaTJKuUNTWT7-e3VHhf3?usp=drive_link" 
                target="_blank" 
                rel="noopener noreferrer"
                className="rules-link"
              >
                Baca Peraturan, Klik Disini
              </a>
            </div>
          </div>

          <div className="form-container">
            <form onSubmit={handleSubmit}>
              {/* --- DATA UTAMA --- */}
              <div className="form-group">
                <label htmlFor="nama" className="form-label">✨ Nama Pendaftar ✨</label>
                <input type="text" id="nama" name="nama" className="form-input" value={formData.nama} onChange={handleMainChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="kelas" className="form-label">🏫 Asal Divisi / Kelas</label>
                <select id="kelas" name="kelas" className="form-input" value={formData.kelas} onChange={handleMainChange} required>
                  <option value="" disabled>-- Pilih Kelas --</option>
                  {daftarKelas.map((kelas, index) => (<option key={index} value={kelas}>{kelas}</option>))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="wa" className="form-label">📞 Nomor Kontak Intel (WhatsApp)</label>
                <input type="tel" id="wa" name="wa" className="form-input" value={formData.wa} onChange={handleMainChange} required pattern="^08\d{8,13}$" title="Nomor WhatsApp harus diawali dengan 08." />
              </div>

              <h2 className="section-title">🗡️ PILIH MEDAN PERTEMPURAN 🛡️</h2>

              <CompetitionItem title="Misi Badai Gurun (Tiup Gelas)" icon="🌪️" lombaKey="tiupGelas" data={formData.lomba.tiupGelas} toggleCompetition={toggleCompetition}>
                <input type="text" className="form-input" placeholder="Nama jagoan tiup badai" value={formData.lomba.tiupGelas.nama} onChange={(e) => handleLombaChange('tiupGelas', e.target.value)} required={formData.lomba.tiupGelas.ikut} />
              </CompetitionItem>
              
              <CompetitionItem title="Misi Ketangkasan Presisi (Paku dlm Botol)" icon="🍾" lombaKey="paku" data={formData.lomba.paku} toggleCompetition={toggleCompetition}>
                <div className="participants-grid">
                  {formData.lomba.paku.peserta.map((nama, index) => (
                    <input key={index} type="text" className="form-input" placeholder={`Penembak Jitu ${index + 1}`} value={nama} onChange={(e) => handleLombaChange('paku', e.target.value, index)} required={formData.lomba.paku.ikut}/>
                  ))}
                </div>
              </CompetitionItem>

              {/* Lomba Tarik Tambang (gabungan) */}
              <div className="competition-item">
                <div className="competition-header main-title">
                  <div className="competition-title"><span className="competition-icon">💪</span> Misi Benteng Pertahanan (Tarik Tambang)</div>
                </div>
                <div className="sub-competition">
                  <CompetitionItem title="Batalyon Putra" icon="👨‍⚔️" lombaKey="tambangPutra" data={formData.lomba.tambangPutra} toggleCompetition={toggleCompetition}>
                    <div className="participants-grid grid-3">
                      {formData.lomba.tambangPutra.peserta.map((nama, index) => (
                        <input key={index} type="text" className="form-input" placeholder={`Kekuatan ${index + 1}`} value={nama} onChange={(e) => handleLombaChange('tambangPutra', e.target.value, index)} required={formData.lomba.tambangPutra.ikut}/>
                      ))}
                    </div>
                  </CompetitionItem>
                </div>
                <div className="sub-competition">
                  <CompetitionItem title="Srikandi Putri" icon="👩‍⚔️" lombaKey="tambangPutri" data={formData.lomba.tambangPutri} toggleCompetition={toggleCompetition}>
                    <div className="participants-grid grid-3">
                      {formData.lomba.tambangPutri.peserta.map((nama, index) => (
                        <input key={index} type="text" className="form-input" placeholder={`Srikandi ${index + 1}`} value={nama} onChange={(e) => handleLombaChange('tambangPutri', e.target.value, index)} required={formData.lomba.tambangPutri.ikut}/>
                      ))}
                    </div>
                  </CompetitionItem>
                </div>
              </div>

              <CompetitionItem title="Misi Logistik Cepat (Makan Kerupuk)" icon="🥨" lombaKey="kerupuk" data={formData.lomba.kerupuk} toggleCompetition={toggleCompetition}>
                <input type="text" className="form-input" placeholder="Si paling lahap dan cepat" value={formData.lomba.kerupuk.nama} onChange={(e) => handleLombaChange('kerupuk', e.target.value)} required={formData.lomba.kerupuk.ikut} />
              </CompetitionItem>

              {/* --- TOMBOL SUBMIT --- */}
              <div className="button-group">
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'MENGIRIM...' : '🚩 DAFTARKAN PASUKAN! 🚩'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
