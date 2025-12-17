import React from 'react';
import { ProductIdentifier } from './ProductIdentifier';
import { Renamer } from './Renamer';

export const Inventory: React.FC = () => {
  return (
    <div className="space-y-16">
      {/* Step 1: Identification */}
      <section>
        <div className="mb-4 flex items-center gap-4">
          <span className="bg-mugen text-white font-marker text-2xl px-4 py-1 border-2 border-ink shadow-sm">STEP 01</span>
          <h3 className="font-marker text-2xl text-ink uppercase">Identify Product</h3>
        </div>
        <ProductIdentifier />
      </section>

      {/* Decorative Divider */}
      <div className="relative h-1 bg-ink w-full my-8">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 font-marker text-xl border-2 border-ink">
          斬
        </div>
      </div>

      {/* Step 2: Renaming */}
      <section id="renamer-anchor">
        <div className="mb-4 flex items-center gap-4">
          <span className="bg-jin text-white font-marker text-2xl px-4 py-1 border-2 border-ink shadow-sm">STEP 02</span>
          <h3 className="font-marker text-2xl text-ink uppercase">Batch Renaming</h3>
        </div>
        <Renamer />
      </section>
    </div>
  );
};