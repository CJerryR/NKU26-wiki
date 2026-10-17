/** Static counterpart of the supplied economic model, without the older ODE predictor.
 * Source: NemaKlear-wiki-component-2026-10-17/app/vendor/.../eco_model_pkg/
 * loss.py: relative_yield_fraction; economics.py: evaluate/net_income.
 * Inputs remain in src/data/model-eco.json, copied unchanged from the submission.
 */
export function evaluateEconomicScenario(density, config) {
  if (typeof density !== 'number' || !Number.isFinite(density) || density < 0 || density > config.loss_function.max_density) {
    throw new RangeError(`Enter a density from 0 to ${config.loss_function.max_density} J2/100 cm³.`);
  }
  const loss = config.loss_function;
  const relativeYield = density <= loss.tolerance_density ? 1 : Math.min(1, Math.max(loss.minimum_relative_yield,
    loss.minimum_relative_yield + (1 - loss.minimum_relative_yield) * loss.z ** (density / loss.tolerance_density - 1)));
  const e = config.economics;
  const potentialRevenue = e.baseline_yield_kg_per_ha * e.price_per_kg;
  const grossLoss = potentialRevenue * (1 - relativeYield);
  const treatmentKey = density < config.grade_thresholds.middle_from_density ? 'low'
    : density < config.grade_thresholds.high_from_density ? 'middle' : 'high';
  const income = (plan, extra = 0) => potentialRevenue - e.baseline_production_cost_per_ha
    - grossLoss * (1 - plan.effect.avoided_loss_fraction) - plan.cost_per_ha - extra;
  const values = [income(config.low), income(config.without_test), income(config[treatmentKey], e.test_cost_per_ha)];
  return { density, treatmentKey, treatment: config[treatmentKey].name_en, relativeYield, grossLoss,
    noControl: values[0], uniform: values[1], guided: values[2],
    benefitVsNoControl: values[2] - values[0], benefitVsUniform: values[2] - values[1] };
}
