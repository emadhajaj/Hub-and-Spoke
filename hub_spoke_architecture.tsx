import React from 'react';
import { Shield, Server, Wifi, Globe, Lock, ArrowRight, Cloud } from 'lucide-react';

const HubSpokeArchitecture = () => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 p-8 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            AWS Hub-and-Spoke Architecture with Network Firewall
          </h1>
          <p className="text-slate-600">Centralized Security and Traffic Inspection</p>
        </div>

        {/* Main Architecture Container */}
        <div className="relative bg-white rounded-lg shadow-2xl p-8">
          
          {/* Internet */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <div className="bg-blue-500 rounded-full p-4 shadow-lg">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700 mt-2">Internet</span>
          </div>

          {/* Hub VPC Container */}
          <div className="border-4 border-blue-400 rounded-lg p-6 mb-8 bg-blue-50/30 mt-8">
            <div className="flex items-center gap-2 mb-6">
              <Cloud className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-blue-800">Hub VPC (10.0.0.0/16)</h2>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Internet Gateway */}
              <div className="col-span-3 flex justify-center mb-4">
                <div className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md font-semibold flex items-center gap-2">
                  <Wifi className="w-5 h-5" />
                  Internet Gateway
                </div>
              </div>

              {/* Jump Server Subnet */}
              <div className="bg-green-100 border-2 border-green-400 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-3 text-center">
                  Jump Server Subnet
                  <div className="text-xs text-green-600">10.0.16.0/20 (Public)</div>
                </h3>
                <div className="bg-white rounded-lg p-3 shadow flex flex-col items-center">
                  <Server className="w-8 h-8 text-green-600 mb-2" />
                  <span className="font-semibold text-sm">Jump Server</span>
                  <span className="text-xs text-slate-600">10.0.24.27</span>
                  <span className="text-xs text-blue-600 mt-1">Public IP ✓</span>
                </div>
              </div>

              {/* NAT Gateway Subnet */}
              <div className="bg-purple-100 border-2 border-purple-400 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-3 text-center">
                  NAT Gateway Subnet
                  <div className="text-xs text-purple-600">10.0.0.0/24 (Public)</div>
                </h3>
                <div className="bg-white rounded-lg p-3 shadow flex flex-col items-center">
                  <Wifi className="w-8 h-8 text-purple-600 mb-2" />
                  <span className="font-semibold text-sm">NAT Gateway</span>
                  <span className="text-xs text-slate-600">For Outbound</span>
                </div>
              </div>

              {/* Firewall Subnet */}
              <div className="bg-orange-100 border-2 border-orange-400 rounded-lg p-4">
                <h3 className="font-semibold text-orange-800 mb-3 text-center">
                  Firewall Subnet
                  <div className="text-xs text-orange-600">10.0.144.0/20 (Private)</div>
                </h3>
                <div className="bg-white rounded-lg p-3 shadow flex flex-col items-center">
                  <Shield className="w-8 h-8 text-orange-600 mb-2" />
                  <span className="font-semibold text-sm">Firewall EC2</span>
                  <span className="text-xs text-slate-600">10.0.155.127</span>
                  <span className="text-xs text-orange-600 mt-1">nftables</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transit Gateway */}
          <div className="flex justify-center my-6">
            <div className="relative">
              <div className="bg-indigo-600 text-white px-8 py-4 rounded-xl shadow-xl flex flex-col items-center">
                <div className="flex items-center gap-3 mb-2">
                  <Wifi className="w-6 h-6" />
                  <span className="font-bold text-lg">Transit Gateway</span>
                  <Wifi className="w-6 h-6" />
                </div>
                <span className="text-xs text-indigo-200">Hub-Spoke-TGW</span>
                <span className="text-xs text-indigo-200">ASN: 64512</span>
              </div>
              {/* Connection lines */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-1 h-12 bg-indigo-400"></div>
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-1 h-12 bg-indigo-400"></div>
            </div>
          </div>

          {/* Spoke VPC Container */}
          <div className="border-4 border-emerald-400 rounded-lg p-6 bg-emerald-50/30">
            <div className="flex items-center gap-2 mb-6">
              <Cloud className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-bold text-emerald-800">Spoke VPC (20.0.0.0/16)</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* VM-01 Subnet */}
              <div className="bg-cyan-100 border-2 border-cyan-400 rounded-lg p-4">
                <h3 className="font-semibold text-cyan-800 mb-3 text-center">
                  VM-01 Subnet
                  <div className="text-xs text-cyan-600">20.0.128.0/20 (Private)</div>
                </h3>
                <div className="bg-white rounded-lg p-3 shadow flex flex-col items-center">
                  <Server className="w-8 h-8 text-cyan-600 mb-2" />
                  <span className="font-semibold text-sm">VM-01</span>
                  <span className="text-xs text-slate-600">20.0.143.94</span>
                  <div className="mt-2 text-xs text-center">
                    <div className="text-green-600">✓ Can ping VM-02</div>
                    <div className="text-green-600">✓ Accept SSH from Jump</div>
                  </div>
                </div>
              </div>

              {/* VM-02 Subnet */}
              <div className="bg-teal-100 border-2 border-teal-400 rounded-lg p-4">
                <h3 className="font-semibold text-teal-800 mb-3 text-center">
                  VM-02 Subnet
                  <div className="text-xs text-teal-600">20.0.144.0/20 (Private)</div>
                </h3>
                <div className="bg-white rounded-lg p-3 shadow flex flex-col items-center">
                  <Server className="w-8 h-8 text-teal-600 mb-2" />
                  <span className="font-semibold text-sm">VM-02</span>
                  <span className="text-xs text-slate-600">20.0.149.206</span>
                  <div className="mt-2 text-xs text-center">
                    <div className="text-red-600">✗ Cannot ping VM-01</div>
                    <div className="text-green-600">✓ Can SSH to VM-01</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Traffic Flow Legend */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-slate-100 rounded-lg p-4 border border-slate-300">
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Security Features
              </h3>
              <ul className="text-xs text-slate-700 space-y-1">
                <li>• Centralized traffic inspection</li>
                <li>• nftables firewall rules</li>
                <li>• IP forwarding enabled</li>
                <li>• Source/Dest check disabled</li>
              </ul>
            </div>

            <div className="bg-slate-100 rounded-lg p-4 border border-slate-300">
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Traffic Flow
              </h3>
              <ul className="text-xs text-slate-700 space-y-1">
                <li>• Jump → Firewall ENI → TGW → Spoke</li>
                <li>• Spoke → TGW → Firewall → NAT → Internet</li>
                <li>• All inter-VPC traffic inspected</li>
              </ul>
            </div>

            <div className="bg-slate-100 rounded-lg p-4 border border-slate-300">
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Firewall Rules
              </h3>
              <ul className="text-xs text-slate-700 space-y-1">
                <li>• VM-01 → VM-02: ICMP ✓, SSH ✗</li>
                <li>• VM-02 → VM-01: ICMP ✗, SSH ✓</li>
                <li>• Hub → VM-01: SSH ✓</li>
                <li>• Hub → VM-02: SSH ✗</li>
              </ul>
            </div>
          </div>

          {/* Key Components */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-indigo-200">
            <h3 className="font-bold text-indigo-900 mb-3">Architecture Highlights</h3>
            <div className="grid grid-cols-4 gap-3 text-xs">
              <div className="bg-white rounded p-2 text-center border border-indigo-100">
                <div className="font-semibold text-indigo-700">Transit Gateway</div>
                <div className="text-slate-600">Central routing hub</div>
              </div>
              <div className="bg-white rounded p-2 text-center border border-indigo-100">
                <div className="font-semibold text-indigo-700">Firewall EC2</div>
                <div className="text-slate-600">Traffic inspection</div>
              </div>
              <div className="bg-white rounded p-2 text-center border border-indigo-100">
                <div className="font-semibold text-indigo-700">NAT Gateway</div>
                <div className="text-slate-600">Outbound internet</div>
              </div>
              <div className="bg-white rounded p-2 text-center border border-indigo-100">
                <div className="font-semibold text-indigo-700">Defense in Depth</div>
                <div className="text-slate-600">Layered security</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-slate-600">
          <p>Enterprise-grade hub-and-spoke network architecture with centralized security inspection</p>
        </div>
      </div>
    </div>
  );
};

export default HubSpokeArchitecture;