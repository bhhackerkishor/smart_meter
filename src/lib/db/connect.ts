import dns from 'node:dns';

// Force public DNS for Atlas SRV resolution
console.log('Current internal DNS servers:', dns.getServers());
dns.setServers(['1.1.1.1', '8.8.8.8']);
console.log('Backend DNS servers set to:', dns.getServers());

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-meter';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    let connectionUri = MONGODB_URI;

    // Manual SRV resolution fallback for restrictive DNS environments
    if (connectionUri.startsWith('mongodb+srv://')) {
      try {
        console.log('Attempting manual SRV & TXT resolution for:', connectionUri);
        const hostPart = connectionUri.split('@')[1].split('/')[0].split('?')[0];
        const srvAddress = `_mongodb._tcp.${hostPart}`;
        
        // Resolve SRV for hostnames
        const srvRecords = await dns.promises.resolveSrv(srvAddress);
        
        // Resolve TXT for options (replicaSet, etc.)
        let txtOptions = '';
        try {
          const txtRecords = await dns.promises.resolveTxt(hostPart);
          if (txtRecords && txtRecords.length > 0) {
            txtOptions = txtRecords.flat().join('&');
            console.log('Successfully resolved TXT options:', txtOptions);
          }
        } catch (e) {
          console.warn('TXT resolution failed, continuing with SRV only.');
        }

        if (srvRecords && srvRecords.length > 0) {
          const shardHosts = srvRecords.map(r => `${r.name}:${r.port}`).join(',');
          const authPart = connectionUri.split('://')[1].split('@')[0];
          const dbName = (connectionUri.split('.mongodb.net/')[1] || '').split('?')[0];
          const originalQuery = (connectionUri.split('?')[1] || '');
          
          // Assemble all options
          const allOptions = [originalQuery, txtOptions, 'ssl=true'].filter(Boolean).join('&');
          
          // Construct standard connection string
          connectionUri = `mongodb://${authPart}@${shardHosts}/${dbName}?${allOptions}`;
          console.log('Successfully resolved SRV to standard nodes with options.');
        }
      } catch (err) {
        console.warn('Manual SRV resolution failed, falling back to driver default:', err);
      }
    }

    cached.promise = mongoose.connect(connectionUri, opts).then((mongoose) => {
      console.log('✅ MongoDB Connected successfully');
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;
