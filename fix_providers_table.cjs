const fs = require('fs');

let content = fs.readFileSync('src/admin/pages/Providers.tsx', 'utf8');

const oldMapRegex = /\{providers\.map\(provider => \([\s\S]*?<\/TableRow>\n\s*\)\)}/;

const newMap = `{providersList.map(provider => (
               <TableRow key={provider.id}>
                  <TableCell className="text-center">
                     <input type="checkbox" className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-3">
                        <img src={provider.img || 'https://via.placeholder.com/40'} alt="" className="h-10 w-10 rounded-full object-cover" />
                        <span className="font-medium text-charcoal">{provider.name}</span>
                     </div>
                  </TableCell>
                  <TableCell className="text-muted text-sm">DOC-{provider.id.toString().slice(-4)}</TableCell>
                  <TableCell className="text-sm">{provider.isDoctor ? 'Doctor' : 'Care Professional'}</TableCell>
                  <TableCell className="text-sm">{provider.spec}</TableCell>
                  <TableCell className="text-sm">{provider.exp}</TableCell>
                  <TableCell className="text-sm">{provider.loc}</TableCell>
                  <TableCell className="text-sm font-medium">★ {provider.rating}</TableCell>
                  <TableCell>
                     {provider.status === "PENDING" ? (
                     <Badge variant="warning" className="bg-amber-100 text-amber-700">Pending</Badge>
                     ) : provider.status === "REJECTED" ? (
                     <Badge variant="default" className="bg-red-100 text-red-700">Rejected</Badge>
                     ) : (
                     <Badge variant="success" className="bg-green-100 text-green-700">Verified</Badge>
                     )}
                  </TableCell>
                  <TableCell>
                     {provider.status === "ACTIVE" || !provider.status ? (
                     <Badge variant="success">Active</Badge>
                     ) : (
                     <Badge variant="default">Inactive</Badge>
                     )}
                  </TableCell>
                  <TableCell className="text-right">
                     {provider.status === 'PENDING' ? (
                       <div className="flex items-center justify-end gap-2">
                         <button onClick={() => handleApprove(provider.id)} className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-lg transition" title="Approve">
                           <Check className="w-4 h-4" />
                         </button>
                         <button onClick={() => handleReject(provider.id)} className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition" title="Reject">
                           <X className="w-4 h-4" />
                         </button>
                       </div>
                     ) : (
                     <Button variant="ghost" size="icon" asChild>
                        <Link to={\`/admin/providers/\${provider.id}\`}>
                           <MoreHorizontal className="h-4 w-4" />
                        </Link>
                     </Button>
                     )}
                  </TableCell>
               </TableRow>
            ))}`;

if (content.match(oldMapRegex)) {
  content = content.replace(oldMapRegex, newMap);
  fs.writeFileSync('src/admin/pages/Providers.tsx', content);
  console.log('Fixed Providers table rendering');
} else {
  console.log('Could not find old map logic');
}
