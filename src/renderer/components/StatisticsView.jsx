import React from 'react';
import { BarChart3, PieChart, Clock, CheckCircle2, Gamepad2, Star, TrendingUp, Award } from 'lucide-react';

export default function StatisticsView({ jogos, generos }) {
  // Cálculos Básicos
  const totalJogos = jogos.length;
  const jogosCompletados = jogos.filter(j => j.status === 'Completado').length;
  const taxaConclusao = totalJogos > 0 ? Math.round((jogosCompletados / totalJogos) * 100) : 0;
  
  const totalMinutos = jogos.reduce((acc, j) => acc + (j.tempo_jogo_minutos || 0), 0);
  const totalHoras = Math.floor(totalMinutos / 60);
  const totalMinutosRestantes = totalMinutos % 60;

  // Distribuição por Status
  const statusCounts = jogos.reduce((acc, j) => {
    acc[j.status] = (acc[j.status] || 0) + 1;
    return acc;
  }, {});

  const statusColors = {
    'Jogando': 'bg-blue-500',
    'Pausado': 'bg-pink-500',
    'Backlog': 'bg-purple-500',
    'Completado': 'bg-green-500',
    'Abandonado': 'bg-red-500',
    'Lista de Desejos': 'bg-yellow-500'
  };

  // Distribuição por Gênero (Top 5)
  const generoCounts = {};
  jogos.forEach(j => {
    if (j.generos) {
      j.generos.forEach(g => {
        generoCounts[g.nome] = (generoCounts[g.nome] || 0) + 1;
      });
    }
  });

  const topGeneros = Object.entries(generoCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const maxGeneroCount = topGeneros.length > 0 ? topGeneros[0][1] : 1;

  // Média de Nota
  const jogosComNota = jogos.filter(j => (j.nota_pessoal || 0) > 0);
  const mediaNota = jogosComNota.length > 0 
    ? (jogosComNota.reduce((acc, j) => acc + j.nota_pessoal, 0) / jogosComNota.length).toFixed(1)
    : '0.0';

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8 animate-in fade-in duration-500">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Gamepad2 className="text-blue-400" />} 
          label="Total de Jogos" 
          value={totalJogos} 
          subtext="Na sua biblioteca"
        />
        <StatCard 
          icon={<Clock className="text-purple-400" />} 
          label="Tempo Total" 
          value={`${totalHoras}h ${totalMinutosRestantes}m`} 
          subtext="Investidos em diversão"
        />
        <StatCard 
          icon={<Award className="text-green-400" />} 
          label="Taxa de Conclusão" 
          value={`${taxaConclusao}%`} 
          subtext={`${jogosCompletados} jogos finalizados`}
        />
        <StatCard 
          icon={<Star className="text-yellow-400" />} 
          label="Média de Notas" 
          value={mediaNota} 
          subtext="Sua satisfação média"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribuição por Status */}
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <PieChart className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-bold text-txt-main">Distribuição por Status</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(statusColors).map(([status, color]) => {
              const count = statusCounts[status] || 0;
              const percent = totalJogos > 0 ? (count / totalJogos) * 100 : 0;
              return (
                <div key={status} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-txt-muted">{status}</span>
                    <span className="font-bold text-txt-main">{count}</span>
                  </div>
                  <div className="h-2 bg-dark-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${color} transition-all duration-1000 ease-out`} 
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Gêneros */}
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-bold text-txt-main">Gêneros Mais Populares</h3>
          </div>
          <div className="space-y-6">
            {topGeneros.length > 0 ? topGeneros.map(([nome, count]) => {
              const percent = (count / maxGeneroCount) * 100;
              return (
                <div key={nome} className="relative group">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-txt-main">{nome}</span>
                        <span className="text-txt-muted">{count} jogos</span>
                      </div>
                      <div className="h-3 bg-dark-900 rounded-lg overflow-hidden border border-dark-700">
                        <div 
                          className="h-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-1000 ease-out" 
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="h-full flex items-center justify-center text-txt-muted italic">
                Adicione gêneros aos seus jogos para ver as estatísticas.
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Rodapé de Motivação */}
      <div className="bg-gradient-to-r from-primary-600/20 to-purple-600/20 border border-primary-500/30 rounded-2xl p-8 flex flex-col items-center text-center space-y-4">
        <Award className="w-12 h-12 text-primary-500 animate-bounce" />
        <div>
          <h3 className="text-xl font-bold text-txt-main">Continue jogando!</h3>
          <p className="text-txt-muted max-w-md mx-auto">
            Sua biblioteca está crescendo. Cada jogo é uma nova experiência e cada finalização é uma conquista.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subtext }) {
  return (
    <div className="bg-dark-800 border border-dark-700 p-6 rounded-2xl shadow-xl hover:border-primary-500/50 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-dark-900 rounded-xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <h4 className="text-txt-muted text-sm font-medium">{label}</h4>
      <div className="text-2xl font-bold text-txt-main mt-1">{value}</div>
      <p className="text-xs text-txt-muted mt-2">{subtext}</p>
    </div>
  );
}
