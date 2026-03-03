// src/components/BackupPanel.jsx
"use client";
import React, { useState } from 'react';
import { HardDrive, Download, Upload, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const BackupPanel = () => {
    const [isLoadingBackup, setIsLoadingBackup] = useState(false);
    const [isLoadingRestore, setIsLoadingRestore] = useState(false);
    const [lastBackup, setLastBackup] = useState(null);
    const [lastRestore, setLastRestore] = useState(null);
    const [archivoSql, setArchivoSql] = useState(null);
    const [logs, setLogs] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleBackup = async () => {
        setIsLoadingBackup(true);
        try {
            const response = await fetch('/api/backup', { method: 'POST' });
            if (!response.ok) throw new Error('Error al generar el backup');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            const date = new Date().toISOString().replace(/[:.]/g, '-');
            a.href = url;
            a.download = `smcat_backup_${date}.sql`;
            a.click();
            window.URL.revokeObjectURL(url);

            setLastBackup(new Date().toLocaleString('es-ES'));
            toast.success('Backup generado y descargado correctamente');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoadingBackup(false);
        }
    };

    const handleRestoreClick = () => {
        if (!archivoSql) {
            toast.warning('Seleccioná un archivo .sql primero');
            return;
        }
        setShowConfirm(true);
    };
    const handleRestoreConfirm  = async () => {
        setShowConfirm(false);
        setIsLoadingRestore(true);
        setLogs([]);

        const pasos = [
            'Leyendo archivo SQL...',
            'Conectando con la base de datos...',
            'Desactivando restricciones de integridad...',
            'Truncando tablas existentes...',
            'Ejecutando statements SQL...',
            'Restaurando datos...',
        ];

        // Simula progreso cada 800ms
        let i = 0;
        const interval = setInterval(() => {
            if (i < pasos.length) {
                setLogs(prev => [...prev, pasos[i]]);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 800);

        try {
            const contenido = await archivoSql.text();
            const response = await fetch('/api/restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sql: contenido }),
            });
            clearInterval(interval);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error al restaurar');

            setLogs(prev => [...prev, '✅ Restauración completada exitosamente.']);
            if (data.resumen) {
                Object.entries(data.resumen).forEach(([tabla, total]) => {
                    setLogs(prev => [...prev, `   📋 ${tabla}: ${total} registros`]);
                });
            }
            setLastRestore(new Date().toLocaleString('es-ES'));
            toast.success('Base de datos restaurada correctamente');
            setArchivoSql(null);
        } catch (error) {
            clearInterval(interval);
            setLogs(prev => [...prev, `❌ Error: ${error.message}`]);
            toast.error(error.message);
        } finally {
            setIsLoadingRestore(false);
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                    <HardDrive className="h-6 w-6 mr-2 text-indigo-600" />
                    Resguardo y Restauración
                </h1>
                <p className="text-gray-500 mb-8">
                    Gestioná los backups completos de la base de datos de SMCAT.
                </p>

                {/* SECCIÓN BACKUP */}
                <div className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-200 p-8 space-y-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
                        Generar Resguardo
                    </h2>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="font-semibold text-gray-700 mb-1">Formato</p>
                            <p>.sql (dump completo)</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="font-semibold text-gray-700 mb-1">Incluye</p>
                            <p>Estructura + datos</p>
                        </div>
                    </div>

                    {lastBackup && (
                        <div className="flex items-center text-green-700 bg-green-50 rounded-lg p-4">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            <span className="text-sm">Último backup: <strong>{lastBackup}</strong></span>
                        </div>
                    )}

                    <button
                        onClick={handleBackup}
                        disabled={isLoadingBackup}
                        className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 
                                   text-white rounded-xl font-semibold hover:bg-indigo-700 
                                   transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isLoadingBackup ? (
                            <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Generando backup...</>
                        ) : (
                            <><Download className="h-5 w-5 mr-2" />Generar y Descargar Backup</>
                        )}
                    </button>
                </div>

                {/* SECCIÓN RESTAURACIÓN */}
                <div className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-200 p-8 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
                        Restaurar desde Backup
                    </h2>

                    <div className="flex items-start text-red-700 bg-red-50 rounded-lg p-4">
                        <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">
                            <strong>Atención:</strong> La restauración reemplaza todos los datos actuales
                            con los del archivo seleccionado. Esta acción no se puede deshacer.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Seleccioná el archivo de backup (.sql)
                        </label>
                        <input
                            type="file"
                            accept=".sql"
                            onChange={(e) => setArchivoSql(e.target.files[0])}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 
                                       file:px-4 file:rounded-lg file:border-0 file:text-sm 
                                       file:font-semibold file:bg-indigo-50 file:text-indigo-700 
                                       hover:file:bg-indigo-100 cursor-pointer"
                        />
                        {archivoSql && (
                            <p className="mt-2 text-sm text-gray-500">
                                Archivo seleccionado: <strong>{archivoSql.name}</strong> ({(archivoSql.size / 1024).toFixed(1)} KB)
                            </p>
                        )}
                    </div>

                    {lastRestore && (
                        <div className="flex items-center text-green-700 bg-green-50 rounded-lg p-4">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            <span className="text-sm">Última restauración: <strong>{lastRestore}</strong></span>
                        </div>
                    )}

                    <button
                        onClick={handleRestoreClick}
                        disabled={isLoadingRestore || !archivoSql}
                        className="w-full flex items-center justify-center px-6 py-3 bg-red-600 
                                   text-white rounded-xl font-semibold hover:bg-red-700 
                                   transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isLoadingRestore ? (
                            <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Restaurando...</>
                        ) : (
                            <><Upload className="h-5 w-5 mr-2" />Restaurar Base de Datos</>
                        )}
                    </button>
                    {logs.length > 0 && (
                        <div className="mt-4 bg-gray-900 rounded-xl p-4 font-mono text-sm space-y-1 max-h-48 overflow-y-auto">
                            {logs.filter(Boolean).map((log, i) => (
                                <div key={i} className={`${log.startsWith('✅') ? 'text-green-400' :
                                    log.startsWith('❌') ? 'text-red-400' :
                                        log.startsWith('   📋') ? 'text-blue-400' :
                                            'text-gray-300'
                                    }`}>
                                    <span className="text-gray-500 mr-2">{'>'}</span>{log}
                                </div>
                            ))}
                            {isLoadingRestore && (
                                <div className="text-yellow-400 animate-pulse">
                                    <span className="text-gray-500 mr-2">{'>'}</span>Procesando...
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showConfirm && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-500 mr-3 flex-shrink-0" />
                <h3 className="text-lg font-bold text-gray-800">Confirmar Restauración</h3>
            </div>
            <p className="text-gray-600 text-sm mb-2">
                Esta acción reemplazará <strong>todos los datos actuales</strong> con los del archivo:
            </p>
            <p className="text-indigo-600 font-semibold text-sm bg-indigo-50 rounded-lg px-3 py-2 mb-6">
                📄 {archivoSql?.name}
            </p>
            <p className="text-red-600 text-sm mb-6 font-medium">
                ⚠️ Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
                <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 
                               font-semibold hover:bg-gray-50 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleRestoreConfirm}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl 
                               font-semibold hover:bg-red-700 transition-colors"
                >
                    Sí, restaurar
                </button>
            </div>
        </div>
    </div>
)}
        </div>
    );
};

export default BackupPanel;