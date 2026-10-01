import type { Template, TinaField } from 'tinacms';
// Field names, template names and the saved JSON shape come from one shared file,
// which the component catalogue also reads. Edit fields there, not here.
import { toolkitSpecs } from '../src/lib/toolkit-specs.mjs';

type Spec = { name: string; kind: string; label: string; hint?: string; accept?: string[]; options?: unknown[]; item?: string; fields?: Spec[] };

const itemLabel = (item: Record<string, unknown>) => ({
  label: String(item.title || item.name || item.code || item.source || item.label || item.date || item.symbol || '条目'),
});

function field(spec: Spec): TinaField {
  const base = { name: spec.name, label: spec.label, ...(spec.hint ? { description: spec.hint } : {}) };
  switch (spec.kind) {
    case 'long': return { ...base, type: 'string', ui: { component: 'textarea' } } as TinaField;
    case 'num': return { ...base, type: 'number' } as TinaField;
    case 'bool': return { ...base, type: 'boolean' } as TinaField;
    case 'file': return { ...base, type: 'image', ...(spec.accept ? { accept: spec.accept } : {}) } as TinaField;
    case 'select': return { ...base, type: 'string', options: spec.options } as TinaField;
    case 'tags': return { ...base, type: 'string', list: true } as TinaField;
    case 'list': return { ...base, type: 'object', list: true, fields: (spec.fields || []).map(field), ui: { itemProps: itemLabel } } as TinaField;
    default: return { ...base, type: 'string' } as TinaField;
  }
}

export const toolkitTemplates: Template[] = (toolkitSpecs as Array<{ name: string; label: string; fields: Spec[] }>)
  .map((spec) => ({ name: spec.name, label: spec.label, fields: spec.fields.map(field) }));
