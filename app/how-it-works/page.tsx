'use client';

import Navbar from '@/components/Navbar';

export default function HowItWorks() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex gap-12">
          {/* Left Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <div className="sticky top-24">
              <nav className="space-y-2">
                <button
                  onClick={() => scrollToSection('acquisition-process')}
                  className="block w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  Acquisition Process
                </button>
                <button
                  onClick={() => scrollToSection('financial-structure')}
                  className="block w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  Financial Structure
                </button>
                <button
                  onClick={() => scrollToSection('platform-advantages')}
                  className="block w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  Platform Advantages
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-4xl">
            {/* Acquisition Process */}
            <div id="acquisition-process" className="mb-16 scroll-mt-24">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Acquisition Process</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Step 1: Pool Participation</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-2">
                Browse our comprehensive card catalog and request cards you believe should be strategically acquired. Join an acquisition pool by paying a one-time entry fee of 0.05 SOL per card. This fee structure funds platform operations, development, and serves as the primary revenue mechanism for sustainable growth.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Pool participants are recorded on-chain with full transparency. Your participation grants you proportional rights to future reward distributions based on the acquisition success of your selected card.
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Step 2: Pool Activation (50 Participants)</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-2">
                Once a card pool reaches 50 participants, it automatically transitions to our Active Targets list. This threshold validates sufficient community demand and economic justification for strategic acquisition. Active targets receive priority allocation of treasury resources.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                The 50-participant requirement ensures market viability and prevents capital deployment on cards with insufficient community backing.
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Step 3: Treasury-Funded Acquisition</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-2">
                All card purchases are executed using capital from our treasury wallet. The treasury maintains a 30% capital reserve for operational security while deploying 70% toward active acquisitions. Treasury balance is publicly visible on the Strategy page with real-time updates every 30 seconds via Helius RPC integration.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Acquisition strategy targets 80-90% supply control of each card through systematic market purchasing, creating significant positioning and influence over card availability and pricing dynamics.
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Step 4: Participant Rewards & Distribution</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-2">
                Upon successful acquisition and achievement of target supply control, pool participants receive proportional rewards through one of two distribution mechanisms:
              </p>
              <ul className="text-sm text-gray-700 space-y-2 ml-4">
                <li className="leading-relaxed">
                  <span className="font-semibold">Card Distribution:</span> Participants receive a proportional share of the acquired card inventory based on their pool participation percentage. Cards are distributed according to participant wallet addresses with transparent allocation tracking.
                </li>
                <li className="leading-relaxed">
                  <span className="font-semibold">Profit Distribution:</span> Alternative reward structure distributes profits generated from market appreciation and strategic sales. Participants receive SOL-denominated rewards proportional to their pool stake, providing liquidity without requiring physical card distribution.
                </li>
              </ul>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">
                Reward distribution mechanism is determined per card based on market conditions, participant preferences, and optimal value realization strategy. All distributions are executed transparently with on-chain verification.
              </p>
            </div>
          </div>
        </div>

            {/* Financial Structure */}
            <div id="financial-structure" className="mb-16 scroll-mt-24">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Financial Structure</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Revenue Model</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                The platform operates on a dual revenue model combining entry fees with market appreciation:
              </p>
              <ul className="text-sm text-gray-700 space-y-2 ml-4">
                <li className="leading-relaxed">
                  <span className="font-semibold">Pool Entry Fees:</span> 0.05 SOL per card request provides immediate operational capital. These fees fund platform development, infrastructure costs, market research, and strategic planning. Entry fees are non-refundable and represent the participant's commitment to the acquisition strategy.
                </li>
                <li className="leading-relaxed">
                  <span className="font-semibold">Creator Fees (Pump.fun):</span> Platform generates additional revenue through creator fees from Pump.fun token launches. These fees provide supplementary capital that enhances treasury reserves and accelerates acquisition capabilities. Creator fee revenue is transparently tracked and allocated according to the same treasury management principles.
                </li>
                <li className="leading-relaxed">
                  <span className="font-semibold">Market Value Appreciation:</span> As the platform achieves 80-90% supply control, artificial scarcity drives market price appreciation. Controlled supply creates favorable conditions for value growth, benefiting all stakeholders including pool participants.
                </li>
                <li className="leading-relaxed">
                  <span className="font-semibold">Strategic Sales:</span> Selective card sales at optimal market conditions generate additional revenue while maintaining majority supply control. Sales proceeds are reinvested into treasury for continued acquisition activities.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Treasury Management & Fiat Conversion</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                Our treasury operates through a sophisticated conversion and allocation process that bridges cryptocurrency revenue with traditional card market purchases:
              </p>
              <ul className="text-sm text-gray-700 space-y-2 ml-4">
                <li className="leading-relaxed">
                  <span className="font-semibold">Revenue Collection:</span> Platform revenue comprises two primary streams: pool entry fees (0.05 SOL per card request) and Pump.fun creator fees from token launches. Both revenue sources are collected in the treasury wallet where they accumulate as liquid cryptocurrency assets. Treasury balance is publicly visible in real-time, providing complete transparency into platform capital reserves and revenue generation.
                </li>
                <li className="leading-relaxed">
                  <span className="font-semibold">Fiat Conversion Process:</span> To facilitate physical card acquisitions from traditional marketplaces (eBay, TCGPlayer, private sales), treasury SOL holdings are systematically converted to fiat currency (USD) through regulated exchanges. This conversion enables direct purchasing power in the Pokemon card market while maintaining regulatory compliance.
                </li>
                <li className="leading-relaxed">
                  <span className="font-semibold">70% Active Buying Power:</span> After fiat conversion, 70% of treasury capital is deployed toward strategic card acquisitions. This majority allocation maximizes acquisition velocity and ensures aggressive pursuit of supply control targets while maintaining prudent capital management practices.
                </li>
                <li className="leading-relaxed">
                  <span className="font-semibold">30% Capital Tax Reserve:</span> A mandatory 30% allocation is reserved specifically for capital gains tax obligations, regulatory compliance costs, and income tax requirements. This conservative tax provisioning ensures full regulatory compliance, prevents unexpected tax liabilities, and maintains platform operational legality. The 30% reserve represents our commitment to sustainable, compliant long-term operations.
                </li>
              </ul>
              <p className="text-sm text-gray-600 leading-relaxed mt-3">
                This dual-allocation structure (70% acquisition / 30% tax reserve) ensures platform sustainability while maintaining aggressive acquisition capabilities. Tax reserves are held in stable assets and adjusted quarterly based on actual tax obligations and regulatory requirements.
              </p>
            </div>
          </div>
        </div>

            {/* Platform Advantages */}
            <div id="platform-advantages" className="mb-16 scroll-mt-24">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Platform Advantages</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Community Governance</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Democratic card selection process where community participation directly influences acquisition priorities. Each pool vote represents genuine market demand, ensuring capital deployment aligns with collective interest rather than centralized decision-making.
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Complete Transparency</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Real-time treasury visibility via public wallet address with 30-second refresh intervals. All transactions recorded on-chain with full audit trail. Acquisition progress tracked publicly on Strategy page with comprehensive holdings disclosure.
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Market Positioning</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Strategic accumulation of 80-90% supply creates dominant market position. Controlled supply enables favorable pricing dynamics, reduces market volatility, and positions platform as primary liquidity provider for rare cards.
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Participant Rewards</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Pool participants receive proportional rewards through card distribution or profit sharing. Reward mechanisms designed to align participant interests with platform success while providing tangible value from acquisition achievements.
              </p>
            </div>
          </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
