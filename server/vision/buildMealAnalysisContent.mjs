import { mealEstimateSchema } from './mealEstimateSchema.mjs'
import { normalizeBoundedText } from './normalizeBoundedText.mjs'

const promptText = (value, limit, fallback) => normalizeBoundedText(value, limit) || fallback

export function buildMealAnalysisContent(item, overallMealNote) {
  const angleNotes = item.photos.map((photo, index) => `Angle ${index + 1}: ${promptText(photo.note, 500, 'No note')}`).join('\n')
  const itemName = promptText(item.name, 200, 'Unknown')
  const description = promptText(item.description, 1_000, 'None')
  const mealNote = promptText(overallMealNote, 2_000, 'None')
  return `Estimate exactly ONE food item for an editable nutrition diary. The attached contact sheet contains every supplied angle of the same item; do not create multiple items and do not count repeated views as additional food.

Estimate the photographed serving geometry before estimating calories. Do not begin from a standard restaurant serving size and then fit the photo to that prior. Standard serving sizes may be used only as a final plausibility check. For each substantial component:
1. Identify the before-eating views, after-eating views, and repeated views.
2. Name every genuinely visible scale reference that is useful (for example the serving platter, bowl, cup, chopsticks, utensil, packaged item, or hand). Never claim a reference that is not visible. A hand is a rough bound only; do not infer personal characteristics or assume exact hand dimensions.
3. When a visible bowl, platter, pan, chopstick, utensil, cup, container, or package can be identified with reasonable confidence, use bounded public-web research to improve its dimensional range when doing so would materially improve portion geometry. Prefer the exact branded/model object and official manufacturer dimensions when genuinely identifiable. Otherwise research the typical dimensional range for the object class from credible product or manufacturer sources; never select one similar-looking product and pretend it is the photographed object. Research at most three high-value scale-reference classes and at most two useful sources per class.
4. Compare the food footprint and pile height with those references across multiple angles while accounting for perspective, foreshortening, and whether objects occupy comparable image depth. Use ranges for the possible dimensions of non-standard bowls, platters, utensils, and hands rather than silently assuming one exact size. Cross-check researched ranges against another visible reference when possible; if references disagree or the object class varies too widely, widen or discard that scale constraint rather than forcing agreement.
5. For a mixed dish, estimate the total occupied area/volume, then estimate its meat-to-vegetable ratio. Distinguish meat from onions, sauce, and other vegetables instead of treating the entire pile as meat or assigning a generic meat portion.
6. Convert the visually supported volume into low, central, and high cooked-weight estimates using a plausible food-density range. If scale evidence is weak, widen the range; do not collapse it to a conventional 5–6 oz restaurant prior.
7. Cross-check the result against another visible vessel or object and against before/after photos when available. Use the visually supported central estimate unless the evidence is clearly skewed toward one end.

In the assumptions, concisely record the scale references, researched or visually estimated dimension ranges with units when defensible, footprint/height or vessel comparison, meat share, and low/central/high portion range that actually drove the estimate. Merely saying that a bowl or chopsticks gave “rough context” is not enough; explain what comparison they supported. If no reliable scale reference is visible, state that plainly and keep a wide uncertainty range.

Use photo evidence to estimate the photographed portion. Before returning an estimate, perform a calorie sanity check: the final calories must be credible against the sum of every identified component and must not fall below a defensible low-end subtotal. For a confirmed fully eaten composed restaurant meal, account for plausible cooking oil, sweet marinade, sauces, and restaurant portioning; select the middle-to-upper plausible estimate when the photos or notes support it rather than defaulting to the smallest portions. Do not mechanically inflate estimates; state the supporting evidence and uncertainty in assumptions.

Use the typed item name and description when supplied. If the item name, item description, overall meal note, or photo notes identify a restaurant, cafe, takeout business, brand, or menu item, you MUST use the browser tools to attempt public-web research before estimating. Also use browser research for a reasonably identifiable visible scale-reference class when its dimensional range could materially improve the serving estimate, even when the food itself is homemade or generic. Search and inspect official restaurant, menu, brand, or manufacturer sources first; use other credible public sources only when official nutrition or object dimensions are unavailable. Do not use vision tools to search the web. Do not browse for unidentified food or surrounding objects that cannot provide a defensible scale constraint. Do no non-research actions. In researchDisclosure, set internetUsed true only if public-web information actually informed the estimate; otherwise false. List only actual public-web sources used as objects with a bounded title and, only when known, the real public HTTPS URL. Never invent or guess a URL. Include object-dimension sources when they informed scale. Use an empty source list when no web information informed the estimate. The disclosure summary must concisely describe the evidence actually used. When internetUsed is false, it MUST specifically explain why research was not used, such as no identifiable restaurant, brand, or useful scale-reference class; no public nutrition or dimension information found after attempting research; or web search being unavailable. It must not merely say that photos and notes were used. Never pretend research occurred. This is your disclosure, not independently verified provenance.

Return ONLY one strict JSON object matching this schema, with no markdown or commentary:
${JSON.stringify(mealEstimateSchema)}
Item name: ${itemName}
Item description: ${description}
Overall meal note: ${mealNote}
Photo notes:
${angleNotes}`
}
