import { useState, useRef, useEffect, useCallback } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const POLL_MS = 4000

// ── Static data ──────────────────────────────────────────────────────────────

const MOVIE_TEMPLATES = [
  {
    id: 'lion_king',
    emoji: '🦁',
    title: 'The Pride Lands',
    sub: 'A tale of courage',
    seed: "Mom and child arrive at a great sun-drenched rock at dawn, welcomed by a vast parade of savanna animals — elephants, zebras, giraffes — stretching to the horizon. A wise old mandrill leads them through golden grasslands and explains the great Circle of Life: every creature, every blade of grass, every parent and child, connected in one enormous web of love. When a curious lion cub leads them too close to the shadowy gorge, a distant rumble builds into a stampede — and mom steps in front of the child without a moment's hesitation, standing firm until the last animal passes. Around a campfire that night, a warthog and a meerkat perform an extremely silly song about not worrying, and the child laughs so hard they fall off their log. The adventure ends at sunset back on the great rock, the whole shining kingdom spread below, and the child leans against mom and says: 'I want to be as brave as you.' Mom looks down and smiles: 'You already are.'",
  },
  {
    id: 'frozen',
    emoji: '❄️',
    title: 'Eternal Winter',
    sub: 'Love melts any spell',
    seed: "A magical spell has frozen the kingdom in endless winter — snow drifts taller than houses, ice flowers bloom on every window, and the river is a perfect mirror of grey sky. Mom and child set out bundled in scarves and mittens, their boots crunching across frozen lakes and through glittering ice caves where every breath makes a cloud of silver sparkle. A cheerful snowman they build in the courtyard blinks awake, tips his twig hat, and insists on joining the quest — he knows a shortcut through the blizzard to the ice palace at the heart of the storm, he says, though his shortcut turns out to be quite long. Inside the palace, soaring walls of blue ice rise to a ceiling of frozen chandeliers, and in the throne room the enchantment pulses cold — but mom steps forward and wraps the child in both arms, and warmth radiates outward from that hug until the ice begins to crack and drip. Spring rushes back in a single golden moment, flowers bursting through snow, birds erupting from the trees — and the snowman looks down at his slightly melting nose with mild concern as mom and child walk home laughing in the sudden sunshine.",
  },
  {
    id: 'brave',
    emoji: '🏹',
    title: 'Highland Wisps',
    sub: 'Follow the magic light',
    seed: "At the edge of a misty Scottish highland, three flickering blue lights appear between the pine trees at dusk and bob gently, as if beckoning — the old stories call them wisps, and the old stories say to follow them. Mom and child sprint through heather-covered moorland, scramble over mossy dry-stone walls, slide down a hill of wet ferns, and arrive breathless at a circle of ancient standing stones silvered by moonlight. An inscription on the tallest stone reads: 'Mend the bond torn by pride — only love that sees clearly can break the spell' — and neither of them is entirely sure what it means, but they look at each other and start to understand. The wisps lead on to a high cliff above a loch where a great shaggy figure stands silhouetted against the stars, and in a burst of golden light the shape becomes a woman, then a bear, then a woman again — the spell unravelling like thread. On the ride home, child on mom's back, the highland stretches in every direction silver and enormous, and mom says: 'That inscription — it was about us.' The child leans their head on mom's shoulder. 'I know,' they say. 'I know.'",
  },
  {
    id: 'finding_nemo',
    emoji: '🐠',
    title: 'The Great Reef',
    sub: 'No ocean is too wide',
    seed: "Mom and child snap on diving masks and slip into the warm water above the world's most dazzling coral reef — turquoise fans and brain coral and staghorn colonies taller than people, all swaying in the current, all alive. A small orange clownfish peers out from his anemone and explains, with considerable urgency, that his little friend has gone missing somewhere on the far side of the reef, and would they please help — because the ocean is enormous and he is not. They follow him past a school of a thousand shimmering silver fish that turns and flashes like a single living mirror, and Mom points out a whale shark the size of a bus cruising slowly overhead, completely serene. A fast current catches them in a kelp forest and they tumble through in a burst of bubbles, holding hands so tightly that when it spits them out on the other side they are still laughing and still together. The little fish is found safe in a sea turtle's slipstream, and as mom and child surface in the late golden light, the clownfish bobs up beside them and says: 'Thank you. No ocean is too wide when someone loves you enough to cross it.' Mom looks at the child. 'No,' she agrees. 'It isn't.'",
  },
  {
    id: 'encanto',
    emoji: '🪄',
    title: 'The Magic Casita',
    sub: 'Family is the gift',
    seed: "A magnificent house in a lush green valley is alive — its windows blink sleepily in the morning, its stairs rearrange themselves to be helpful, and the kitchen makes arepas by itself at precisely the right moment. Mom and child are welcomed in by a warm, enormous family, each member with an impossible gift: one can make flowers bloom with a glance, one hears whispers from three mountains over, one is so strong she cracks the floor just by being joyful. The child finds a tiny golden door behind a bookshelf that leads to a room where all the family's best memories are kept as glowing jars — first steps, first laughs, first times someone said 'I love you' and really meant it — and the room hums with warmth like an oven just opened. Mom lifts a jar labelled 'The day you were born' and holds it to the light, and it fills the whole room with sunrise and the sound of a baby's first surprised laugh. They bring the jar back to the family table and everyone crowds around it, and the Casita's tiles shift underfoot to spell out a single word: LOVE. Then the kitchen serves more arepas, because it always knows what's needed.",
  },
  {
    id: 'moana',
    emoji: '🌊',
    title: 'Heart of the Ocean',
    sub: 'Answer the call',
    seed: "The ocean itself sends the invitation — a spiral of silver fish appearing at the shoreline, pointing toward the horizon — and mom and child climb into a hand-carved voyager canoe with a sail the colour of a manta ray's wings and set off into the wide blue. Dolphins race alongside for the first hour, leaping and spinning, and a sea turtle the size of a dining table surfaces to offer directions in a slow, unhurried voice, then sinks back into the green dark. On a small volcanic island ringed by black sand, they find what they came for: a glowing green stone half-buried in ash, the heart of something ancient and sleeping, and the moment the child picks it up the ocean goes perfectly still and very warm. The journey back takes them through a night so clear the stars reflect in the water, and sailing between the real stars above and their reflections below feels like flying through the sky. When the heart is returned at the edge of the world, the ocean erupts in bioluminescent green, the horizon fills with colour, and a great wave lifts the canoe gently homeward — mom's arms around the child, the child's face turned up to the light.",
  },
  {
    id: 'inside_out',
    emoji: '🎭',
    title: 'Islands of the Mind',
    sub: 'Every feeling matters',
    seed: "Mom and child shrink to the size of fireflies and float into a world built entirely of feelings — Joy's island is made of gold and sunflower fields, Sadness's is a quiet blue peninsula where it always rains softly, and between them a little train of glowing orbs runs day and night carrying memories from place to place. They board the memory train and the windows show them the best moments of their life together: the afternoon they made pancakes and got batter on the ceiling, the morning they watched the sun rise from a hilltop wrapped in a single blanket, the evening they stayed up reading past midnight because neither could stop. A small anxious figure has scattered some of the memories into corners, and a few have gone dark and dusty from not being visited — but mom finds one they had both forgotten, a tiny golden orb tucked behind the archive, labelled: 'Every time Mom held my hand.' She rolls it gently into the light and it blazes gold and fills the whole carriage with warmth. On the way back to the real world, Joy waves from her island: 'The best memories are always made the same way!' and mom squeezes the child's hand, knowing exactly what she means.",
  },
  {
    id: 'tangled',
    emoji: '🏮',
    title: 'The Floating Lanterns',
    sub: 'A festival night',
    seed: "In a kingdom of cobblestone streets and flower-draped bridges, tonight is the once-a-year festival when ten thousand glowing lanterns are released into the sky — and mom and child have spent all afternoon painting theirs with their handprints in gold and red. They navigate the festival crowds past stalls selling roasted chestnuts and cinnamon swirls, dodge the enormous palace guards who are trying to look stern but keep breaking into smiles, and find the best spot on the old stone bridge above the river just as the first lanterns begin to rise. Hundreds, then thousands, then tens of thousands of warm lights lift into the darkness, and the child grips mom's arm and says nothing at all, which is what pure wonder looks like. Mom helps light their lantern's small candle — they hold it cupped between their four hands for a moment, feeling the heat rise — and then let it go and watch it climb to join the river of light. It rises until it is indistinguishable from a star, and the child makes a wish and refuses to say what it is, and mom laughs and makes a wish too, and the whole sky is gold and warm and full of people who are, right now, the happiest they have ever been.",
  },
  {
    id: 'little_mermaid',
    emoji: '🧜‍♀️',
    title: 'Beneath the Waves',
    sub: 'A shimmering kingdom',
    seed: "A magic pearl washes onto the beach at sunrise and when mom and child each hold one end, the air fills with bubbles and their feet shimmer and merge into gleaming tails, and the sea calls them in. Beneath the surface a whole kingdom glitters: coral towers wrapped in sea anemones, arches of polished white shell, schools of parrotfish in electric blue and yellow drifting like confetti, and a friendly crab in a tiny bow tie who materialises at their elbow and appoints himself official guide with enormous self-importance. He leads them through the grand palace gates (carved from a single enormous conch shell), past an auditorium where a choir of glowing fish are rehearsing something very ambitious, to the sea garden where treasures from five hundred shipwrecks are displayed on shelves of black rock — compasses, hourglasses, a red shoe, an undelivered letter in a bottle. A sea witch emerges from a cloud of dark ink and gestures theatrically at mom's voice — 'I'll take that, if you don't mind' — and the child steps directly in front of mom and says with great calm: 'Her voice is the thing I love most in the world. You cannot have it.' The witch shrinks back. Sebastian raises his claw and begins to conduct, and the concert that follows is the most joyful noise the ocean has ever made.",
  },
  {
    id: 'toy_story',
    emoji: '🚀',
    title: 'When Toys Wake Up',
    sub: 'Adventure in the bedroom',
    seed: "The bedroom light clicks off, the house goes quiet — and then, very slowly, every toy in the room opens its eyes. The stuffed bear stretches his arms above his head. The wooden train lets out the softest possible toot. A small plastic astronaut climbs to the top of the bookshelf to look at the night sky through the curtain gap and announces that the stars are, in his professional opinion, excellent tonight. Mom and child are toy-sized now, no taller than an action figure, and the room is an enormous adventure landscape: the duvet mountain, the sock-drawer fortress, the vast carpet sea crossed by a pencil raft. A brave cowboy in a battered hat leads the expedition in search of a small wind-up dinosaur who has gone missing and whose absence has made all the other toys quietly anxious — because toys, it turns out, feel things very deeply. They find him behind a boot, a little frightened by a loud noise earlier, and the child kneels down and gives him a hug until his key unwinds and he begins to spin and chatter happily again. The toys hold a parade around the room's entire perimeter, the train leading and the bear bringing up the rear, and just before the first light of morning creeps under the curtain, everything creeps back to its place — and the cowboy tips his hat to mom and says, very quietly: 'You were the best part of the adventure, ma'am.'",
  },
]

const BOOK_TEMPLATES = [
  {
    id: 'goodnight_moon',
    emoji: '🌙',
    title: 'A Moonlit Goodnight',
    sub: 'Cosy bedtime magic',
    seed: "The old house is warm and quiet, the last lamp burning low, and mom and child begin their goodnight ritual — but tonight each 'goodnight' is a small magic spell that opens a glowing door in the bedroom wall into a soft moonlit world. They step through into a place where the moon is so large it fills half the sky, and all the sleeping creatures of the night — fireflies like drifting sparks, owls blinking from their branches, hedgehogs trundling through silver grass — pause and say goodnight back. A great bowl of warm porridge sits on a cloud table and they eat it together while a sleeping rabbit murmurs contentedly in a dream nearby, and nothing is urgent and everything is peaceful. The stars slowly rearrange themselves into the shapes of the things the child loves most: a bicycle, a cat, a favourite toy, and finally the outline of a mom and child holding hands, which stays longest. Back in the warm bedroom the child's eyes are already closing before they reach the pillow, and mom tucks the blanket up to the chin and says one last goodnight — and from beyond the wall, very faintly, all the moonlit creatures whisper it back.",
  },
  {
    id: 'hungry_caterpillar',
    emoji: '🐛',
    title: 'From Egg to Wings',
    sub: 'A colourful journey',
    seed: "On a bright Sunday morning, mom and child find the tiniest pale green egg on the underside of a broad leaf — and it blinks at them, which is unusual but promising. They follow the extraordinary caterpillar as it hatches and begins eating its way through the world with focused determination: one perfect red strawberry, two crisp yellow pears, three fat purple plums, a fat slice of chocolate birthday cake that it eats with both ends simultaneously, leaving perfectly round holes in everything, a trail of eaten world behind it. Mom and child build a small cosy shelter of leaves and silk thread at the base of the garden wall, and they check on it every morning, each time finding it slightly changed, slightly still, the mystery of what's happening inside impossible to rush. On the fifth morning the cocoon trembles — and splits — and out unfolds the most extraordinary set of wings either of them has ever seen, stained glass in amber and black, trembling in the morning light as if remembering how to exist. The butterfly lands on the child's nose for exactly one heartbeat, long enough to be absolutely certain it happened, and then lifts into the sky — and mom says: 'That's what love does. It helps things become what they were always meant to be.'",
  },
  {
    id: 'winnie_pooh',
    emoji: '🍯',
    title: 'Honey & Friends',
    sub: 'A golden afternoon',
    seed: "On a golden autumn afternoon in a wood where the trees have ancient kind faces and the light falls in long amber columns, mom and child set out with an empty honey pot and no plan at all, which is exactly the right way to start an adventure in this particular wood. They find Piglet first, hiding inside an overturned flowerpot because he is quite certain he saw a heffalump, and mom coaxes him out gently while the child holds his small pink hand until he stops trembling. Then there is an enormous crashing from above and Tigger arrives, having bounced from a branch that turned out to be higher than expected, who insists he knows exactly where the honey is kept and sets off with great confidence in slightly the wrong direction, and everyone follows because he is so very enthusiastic about it. The honey pot does eventually get filled, and a small feast is arranged on a mossy log — honey sandwiches, a slightly squashed cake, and two cups of tea that taste much better for being outdoors. As the light turns red and the wood grows soft and quiet, all the friends sit in a circle and say what they are grateful for, and Pooh says: 'I am rather fond of today,' and mom puts her arm around the child, and they are all, in this moment, perfectly happy.",
  },
  {
    id: 'wild_things',
    emoji: '👑',
    title: 'The Wild Rumpus',
    sub: 'Where the wild things are',
    seed: "The child has been sent to their room and in the fierce heat of imagination the walls begin to grow — first vines, then trees, then a whole forest — and the floor becomes ocean, and a small sturdy boat appears at the foot of the bed and bobs patiently until the child climbs in. The boat sails through night and day and night, past stars and flying fish and islands no map has ever shown, to the place where the wild things live: enormous creatures with yellow eyes and terrible claws who roar their terrible roars and gnash their terrible teeth and roll their terrible eyes. The child is not afraid. 'Let the wild rumpus start!' — and it does, magnificent and thunderous, swinging from vines and howling at the moon and galloping so fast through the dark trees that everything blurs and the night fills with the noise of pure wild joy. But in the very middle of the wildest, loudest rumpus there has ever been, the child smells something warm and impossible: the smell of supper, of home, of Mom. The wild things beg and roar and plead but the child climbs back into the little boat, and when it bumps against the bedroom floor, mom is there — supper still warm, face not angry but relieved — because she was always going to be there, waiting, exactly as she always is.",
  },
  {
    id: 'matilda',
    emoji: '📚',
    title: 'The Clever Child',
    sub: 'Extraordinary powers',
    seed: "The child discovers the power by accident one Tuesday morning — a pencil rolls toward the table edge, and stops, and hovers — and when they tell mom with wide eyes, she believes them completely and immediately, which turns out to be the most important thing anyone has ever done. They practice in secret: books float gently from shelves and land open at exactly the right page, jam jars open themselves with a satisfying pop, and once — just once — a full cup of tea pauses in mid-air for three seconds and then lands without spilling a drop, which mom and child agree was the most impressive thing that has ever happened in the kitchen. School is another matter — the dreadful headmistress runs it like a small mean prison and is particularly suspicious of children who are cleverer than she is, which is all of them — but the clever child has read every book in the library twice and built a plan as careful and intricate as a spider's web. On the day it matters most, when the headmistress threatens to expel the kindest teacher in the school, the child's eyes go very dark with concentration — and the headmistress's enormous hat lifts, slowly, with great dignity, off her head, and drops into the fish tank. The school erupts. The kind teacher is saved. Walking home, mom takes the child's hand and says: 'Never let anyone tell you your gift is too much.' The child looks up. 'You never did,' they say.",
  },
  {
    id: 'cat_in_hat',
    emoji: '🎩',
    title: 'A Very Silly Day',
    sub: 'Nothing stays ordinary',
    seed: "The rain is coming down sideways, the afternoon stretches out grey and endless, there is absolutely nothing to do — and then there is a BUMP and a THUMP and a BUMP from the front hall, and a very tall cat in a very tall red-and-white striped hat bows in the doorway with the expression of someone who has been waiting a very long time to be invited in. The cat has a large red crate, and inside the crate is essentially everything: a kite the size of a living room ceiling, two small creatures who immediately begin running in opposite directions, a pink cake that serves itself, a miniature indoor rainstorm in a jar, and a fish in a bowl who disapproves loudly of all of it and says so at every opportunity. Mom and child chase the cake through the kitchen, free the kite from the chandelier, rescue the fish from inside the washing machine, and find one of the small creatures in the umbrella stand — all while laughing so hard that the whole adventure seems to be happening slightly sideways. Then there is the sound of the front door, and the cat produces a machine that cleans everything in fourteen seconds flat, leaving the house perfect and peaceful. Mom comes in from the shops to find two members of her household sitting on the sofa reading with expressions of tremendous innocence, and if there is a slight smell of fish and kite-string in the air, nobody mentions it.",
  },
  {
    id: 'giving_tree',
    emoji: '🌳',
    title: 'The Giving Tree',
    sub: 'A love without limit',
    seed: "When the child is small, the apple tree at the edge of the garden is a whole kingdom — its branches are a castle turret, its roots are a throne, its fallen leaves are gold coins, and mom lifts the child up so they can reach the very highest apple, the reddest one, the one that catches the last of the afternoon light. The tree gives everything without hesitation or complaint through all the seasons of growing up: apples for spending money, branches for building, its great trunk for a boat to sail away on — each gift given with such complete and uncomplaining love that it is only much later the child begins to understand the true size of what was offered. Mom and child plant a tiny new sapling beside the old stump and water it every morning, and the child explains to the sapling, in a serious voice, that it has a lot to live up to. Years pass in the panels the way years do — quickly on the page, enormous in life — and in the last panel the child, now grown, sits on the old stump in the same late afternoon light, and a small voice says: 'Can I climb you?' The grown child looks down to see their own child, bright-eyed and reaching up, and says: 'Of course. That is what I am here for.' The tree was always, only, ever a love story.",
  },
  {
    id: 'gruffalo',
    emoji: '🦊',
    title: 'Deep Dark Wood',
    sub: 'Outsmart the monsters',
    seed: "The deep dark wood smells of pine resin and old earth and somewhere a woodpecker is knocking a steady beat, and the child walks in boldly because the child has invented, in vivid detail, a creature so terrifying that nothing in the wood would dare come close — terrible tusks, terrible claws, orange eyes, knobbly knees — a creature called the Gruffalo, which does not exist. A fox appears first, teeth gleaming, but one calm description of the Gruffalo sends it pelting away through the bracken. An owl swoops from a branch, a snake uncoils from a root, and each time the child describes the Gruffalo with more detail and more confidence and each creature retreats faster than the last — until there is a rustling, a crashing, a splintering of branches, and something very large and very real approaches through the trees. The creature that steps into the clearing has terrible tusks, terrible claws, orange eyes, and knobbly knees — exactly as described — and it is looking directly at the child with great interest. Mom steps out from behind the oak where she has been watching the whole time and fixes the monster with a look of such complete, unhurried calm that it blinks once, twice — and turns and disappears back into the deep dark. 'How did you do that?' the child breathes. Mom shrugs. 'I'm your mum,' she says simply. 'I'm considerably scarier.'",
  },
  {
    id: 'charlottes_web',
    emoji: '🕷️',
    title: 'Words in the Web',
    sub: 'Friendship on the farm',
    seed: "The pig arrived in a cardboard box on a damp April morning and was named Wilbur, and from the first day the child has visited his pen before school without fail, scratching him behind the ears and telling him the news, because Wilbur listens with more attention than most. High in the rafters of the old barn, grey and quiet and practically invisible unless you know where to look, lives Charlotte — eight eyes that see everything, a voice like the creak of a rope bridge, and a mind that moves in careful patterns. When the child overhears something frightening about Wilbur's future, it is Charlotte who speaks first: 'I have a plan,' she says, 'and it will require some very good writing.' She begins, one silver thread at a time, to weave words into her web that catch the morning light and make everyone who passes stop and stare upward: TERRIFIC, spelled out in dew-bright silk. Then RADIANT. Then HUMBLE. Each word causes a small quiet miracle and Wilbur stands taller each time. Mom lifts the child so they can look closely at the finished web trembling in the sunrise, every thread perfect, the whole thing shining — and the child asks: 'Why did she do all of that for him?' Mom is quiet for a long moment. 'Because,' she says at last, 'that is what it looks like, when someone really loves you. They use whatever they have.'",
  },
  {
    id: 'narnia',
    emoji: '🦁',
    title: 'Through the Wardrobe',
    sub: 'A snowy kingdom awaits',
    seed: "The wardrobe smells of cedar wood and old coats, and the coats at the back are very thick and very many — but there is something beyond them, something cold that crunches softly underfoot, and when the child pushes through, snowflakes land on their eyelashes and a whole world opens up, white and grey and utterly, perfectly silent. A single lamp-post glows amber in the grey light of a forest where snow weighs down every branch, and beneath it a faun stands with an umbrella and an armful of parcels, who bows and introduces himself and produces hot tea from somewhere inside his scarf with the calm of someone who has been expecting them. Mom steps through after the child and the faun's eyes go wide — there has not been a human mother in Narnia for a hundred years and a hundred winters, he says, and something in the frozen air shifts at the words. They follow the faun through snow-laden pines to the camp of the great lion, whose mane is gold and whose eyes are the precise colour of warm amber and who bows his enormous head to mom with complete and quiet seriousness. The battle they help to fight is not with swords but with something older — a love that refuses to give up — and when the first snowdrop pushes through the white ground at their feet, the hundred-year winter is over, and mom holds the child close as the world warms around them and the lion watches from a distance and says nothing, because nothing needs to be said.",
  },
]

const STYLES = [
  { id: 'cartoon',   label: 'Cartoon',   sub: 'Bold & vibrant' },
  { id: 'storybook', label: 'Storybook', sub: 'Soft watercolour' },
  { id: 'manga',     label: 'Manga',     sub: 'Anime style' },
  { id: 'vintage',   label: 'Vintage',   sub: 'Retro comic' },
]

const TEMPLATE_SOURCE = {
  lion_king:          'The Lion King',
  frozen:             'Frozen',
  brave:              'Brave',
  finding_nemo:       'Finding Nemo',
  encanto:            'Encanto',
  moana:              'Moana',
  inside_out:         'Inside Out',
  tangled:            'Tangled',
  little_mermaid:     'The Little Mermaid',
  toy_story:          'Toy Story',
  goodnight_moon:     'Goodnight Moon',
  hungry_caterpillar: 'The Very Hungry Caterpillar',
  winnie_pooh:        'Winnie-the-Pooh',
  wild_things:        'Where the Wild Things Are',
  matilda:            'Matilda',
  cat_in_hat:         'The Cat in the Hat',
  giving_tree:        'The Giving Tree',
  gruffalo:           'The Gruffalo',
  charlottes_web:     "Charlotte's Web",
  narnia:             'The Lion, the Witch and the Wardrobe',
}

// ── Helper ───────────────────────────────────────────────────────────────────

function isHeic(file) {
  return file?.name?.toLowerCase().match(/\.heic?$|\.heif?$/)
}

// ── Photo upload slot ─────────────────────────────────────────────────────────

function PhotoSlot({ label, emoji, preview, file, inputRef, onPick, name, onName, nameHint, showName = true }) {
  return (
    <div className="photo-slot">
      <p className="slot-label">{label}</p>
      <button
        className={`slot-zone ${preview ? 'slot-zone--filled' : ''}`}
        onClick={() => inputRef.current?.click()}
        type="button"
        aria-label={`Upload ${label} photo`}
      >
        {preview ? (
          isHeic(file) ? (
            <div className="slot-heic">
              <span>📷</span>
              <p>{file.name}</p>
            </div>
          ) : (
            <img src={preview} alt={`${label} preview`} className="slot-img" />
          )
        ) : (
          <div className="slot-placeholder">
            <span className="slot-emoji">{emoji}</span>
            <span className="slot-cta">Tap to upload</span>
          </div>
        )}
        {preview && <div className="slot-change-hint">Tap to change</div>}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        style={{ display: 'none' }}
        onChange={e => onPick(e.target.files?.[0])}
      />
      {showName && (
        <input
          className="name-input"
          type="text"
          placeholder={nameHint}
          value={name}
          onChange={e => onName(e.target.value)}
          maxLength={30}
        />
      )}
    </div>
  )
}

// ── Step: Photos ──────────────────────────────────────────────────────────────

function PhotosStep({ momPreview, momFile, childPreview, childFile, childName,
                       momRef, childRef, onPickMom, onPickChild,
                       onChildName, errorMsg, onNext, canNext }) {
  return (
    <div className="step-wrap">
      <div className="step-header">
        <h2>Upload your photos</h2>
        <p className="step-sub">We'll put you both inside the story</p>
      </div>

      <div className="photo-row">
        <PhotoSlot
          label="Mom" emoji="👩" preview={momPreview} file={momFile}
          inputRef={momRef} onPick={onPickMom}
          showName={false}
        />
        <PhotoSlot
          label="Child" emoji="🧒" preview={childPreview} file={childFile}
          inputRef={childRef} onPick={onPickChild}
          name={childName} onName={onChildName} nameHint="Child's name (optional)"
        />
      </div>

      {errorMsg && <p className="error-msg">{errorMsg}</p>}

      <button className="primary-btn" disabled={!canNext} onClick={onNext}>
        Choose Story →
      </button>
    </div>
  )
}

// ── Step: Story ───────────────────────────────────────────────────────────────

function StoryStep({ template, setTemplate, customNotes, setCustomNotes,
                      style, setStyle, errorMsg, onBack, onGenerate, canGenerate }) {
  const getInitialCategory = () => {
    if (!template || template === 'custom') return 'movies'
    if (MOVIE_TEMPLATES.some(t => t.id === template)) return 'movies'
    return 'books'
  }
  const [category, setCategory] = useState(getInitialCategory)

  function switchCategory(cat) {
    setCategory(cat)
    if (cat === 'custom') setTemplate('custom')
    else if (template === 'custom') setTemplate(null)
  }

  const CATEGORY_TABS = [
    { id: 'movies', label: '🎬 Popular Movies' },
    { id: 'books',  label: '📖 Popular Books'  },
    { id: 'custom', label: '✨ Write Your Own' },
  ]

  const visibleTemplates = category === 'movies' ? MOVIE_TEMPLATES : BOOK_TEMPLATES

  return (
    <div className="step-wrap">
      <div className="step-header">
        <h2>Pick your story</h2>
        <p className="step-sub">Choose a theme or write your own adventure</p>
      </div>

      <div className="category-tabs">
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab.id}
            className={`category-tab ${category === tab.id ? 'category-tab--active' : ''}`}
            onClick={() => switchCategory(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {category !== 'custom' ? (
        <div className="template-grid mt-12">
          {visibleTemplates.map(t => (
            <button
              key={t.id}
              className={`template-card ${template === t.id ? 'template-card--selected' : ''}`}
              onClick={() => setTemplate(t.id)}
              type="button"
            >
              <span className="tmpl-emoji">{t.emoji}</span>
              <span className="tmpl-title">{t.title}</span>
              <span className="tmpl-sub">{t.sub}</span>
              {TEMPLATE_SOURCE[t.id] && (
                <span className="tmpl-source">inspired by {TEMPLATE_SOURCE[t.id]}</span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <textarea
          className="custom-textarea mt-12"
          placeholder="e.g. We go on a beach adventure, find a mermaid, and end with a big hug on the sand..."
          value={customNotes}
          onChange={e => setCustomNotes(e.target.value)}
          rows={5}
        />
      )}

      <div className="card mt-12">
        <p className="field-label">Art style</p>
        <div className="style-row">
          {STYLES.map(s => (
            <button
              key={s.id}
              className={`style-chip ${style === s.id ? 'style-chip--selected' : ''}`}
              onClick={() => setStyle(s.id)}
              type="button"
            >
              <span className="style-label">{s.label}</span>
              <span className="style-sub">{s.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {errorMsg && <p className="error-msg mt-12">{errorMsg}</p>}

      <div className="btn-row mt-12">
        <button className="ghost-btn" onClick={onBack}>← Back</button>
        <button className="primary-btn primary-btn--wide" disabled={!canGenerate} onClick={onGenerate}>
          ✨ Create Comic
        </button>
      </div>
    </div>
  )
}

// ── Step: Generating ──────────────────────────────────────────────────────────

function GeneratingStep({ statusData, onPanelClick }) {
  const panels      = statusData.panels ?? []
  const panelsDone  = statusData.panels_done ?? 0
  const panelsTotal = statusData.panels_total ?? 6
  const stepLabel   = statusData.step ?? 'Getting started…'

  const pct = panelsTotal > 0
    ? Math.round((panelsDone / (panelsTotal + 1)) * 100)
    : 5

  return (
    <div className="step-wrap generating-wrap">
      <div className="gen-header">
        <div className="spinner" />
        <h2>Creating your comic…</h2>
        <p className="gen-sub">{stepLabel}</p>
      </div>

      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="progress-label">{panelsDone} of {panelsTotal} panels drawn</p>

      {panels.length > 0 && (
        <div className="panel-preview-grid">
          {panels.map(p => (
            <div
              key={p.panel}
              className="panel-thumb panel-thumb--loaded"
              onClick={() => onPanelClick(p.image_url)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onPanelClick(p.image_url)}
              title="Tap to enlarge"
            >
              <img src={p.image_url} alt={`Panel ${p.panel}`} />
            </div>
          ))}
          {Array.from({ length: Math.max(0, panelsTotal - panels.length) }).map((_, i) => (
            <div key={`ph-${i}`} className="panel-thumb panel-thumb--pending">
              <div className="panel-pending-inner">
                <div className="mini-spinner" />
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="gen-note">
        This takes 2–3 minutes.
        <strong> Bookmark this page</strong> — if you close the tab you can come back to it later.
      </p>
    </div>
  )
}

// ── Step: Result ──────────────────────────────────────────────────────────────

function ResultStep({ statusData, childName, onReset, onPanelClick, jobId }) {
  const panels = statusData.panels ?? []
  const [copied, setCopied] = useState(false)

  function shareComic() {
    const url = `${window.location.origin}${window.location.pathname}?comic=${jobId}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  async function downloadPanel(url, n, e) {
    e.stopPropagation()
    try {
      const blob = await fetch(url).then(r => r.blob())
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `mom-and-me-panel-${n}.png`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      // fallback: open in new tab
      window.open(url, '_blank')
    }
  }

return (
    <div className="step-wrap result-wrap">
      <div className="result-header">
        <div className="result-title-row">
          <span className="heart-icon">💝</span>
          <h2>
            {childName}'s<br />
            <span className="title-accent">Mother's Day Comic</span>
          </h2>
          <span className="heart-icon">💝</span>
        </div>
        <p className="result-sub">Your personalised comic book is ready! Tap a panel to enlarge.</p>
      </div>

      <div className="comic-scroll">
        {panels.map(p => (
          <div key={p.panel} className="comic-panel">
            <img src={p.image_url} alt={`Panel ${p.panel}`} className="comic-panel-img" />
            <button
              className="panel-dl-btn"
              onClick={(e) => downloadPanel(p.image_url, p.panel, e)}
              title="Download this panel"
            >
              ↓
            </button>
          </div>
        ))}
      </div>

      <div className="result-actions">
        {jobId && (
          <button className="ghost-btn" onClick={shareComic}>
            {copied ? '✓ Copied!' : '🔗 Share'}
          </button>
        )}
        <button className="primary-btn" onClick={onReset}>💝 Make Another</button>
      </div>
    </div>
  )
}

// ── Step indicator ────────────────────────────────────────────────────────────

const STEP_LABELS = ['Photos', 'Story', 'Create', 'Done']
const STEP_INDEX  = { photos: 0, story: 1, generating: 2, result: 3 }

function StepBar({ step }) {
  const current = STEP_INDEX[step] ?? 0
  return (
    <nav className="step-bar" aria-label="Progress">
      {STEP_LABELS.map((label, i) => (
        <div key={label} className="step-item-wrap">
          <div className={`step-item ${i < current ? 'step-past' : ''} ${i === current ? 'step-current' : ''}`}>
            <div className="step-dot">{i < current ? '✓' : i + 1}</div>
            <span className="step-dot-label">{label}</span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div className={`step-connector ${i < current ? 'step-connector--done' : ''}`} />
          )}
        </div>
      ))}
    </nav>
  )
}

// ── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ url, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
        <img src={url} alt="Comic panel" className="lightbox-img" />
        <button className="lightbox-close" onClick={onClose} aria-label="Close">✕</button>
      </div>
    </div>
  )
}

// ── Root App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [step, setStep] = useState('photos')

  // Resume from URL on mount (?comic=<job_id>)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sharedJobId = params.get('comic')
    if (!sharedJobId) return

    setJobId(sharedJobId)
    setStep('generating')

    fetch(`${API_BASE}/api/comic-status/${sharedJobId}`)
      .then(r => r.json())
      .then(data => {
        setStatusData(data)
        if (data.status === 'done') {
          setStep('result')
        } else if (data.status === 'error') {
          setErrorMsg(data.error ?? 'Generation failed')
          setStep('photos')
          window.history.replaceState({}, '', window.location.pathname)
        } else {
          // still processing — start polling
          pollRef.current = setInterval(() => pollStatus(sharedJobId), POLL_MS)
        }
      })
      .catch(() => {
        setStep('photos')
        window.history.replaceState({}, '', window.location.pathname)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Photos
  const [momFile,      setMomFile]      = useState(null)
  const [momPreview,   setMomPreview]   = useState(null)
  const [childFile,    setChildFile]    = useState(null)
  const [childPreview, setChildPreview] = useState(null)
  const [childName,    setChildName]    = useState('')

  // Story
  const [template,    setTemplate]    = useState(null)
  const [customNotes, setCustomNotes] = useState('')
  const [style,       setStyle]       = useState('cartoon')

  // Generation
  const [jobId,       setJobId]       = useState(null)
  const [statusData,  setStatusData]  = useState({})
  const [errorMsg,    setErrorMsg]    = useState(null)
  const [lightboxUrl, setLightboxUrl] = useState(null)
  const pollRef  = useRef(null)
  const momRef   = useRef(null)
  const childRef = useRef(null)

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }, [])

  useEffect(() => () => stopPolling(), [stopPolling])

  function pickMom(file) {
    if (!file) return
    if (momPreview) URL.revokeObjectURL(momPreview)
    setMomFile(file)
    setMomPreview(URL.createObjectURL(file))
  }

  function pickChild(file) {
    if (!file) return
    if (childPreview) URL.revokeObjectURL(childPreview)
    setChildFile(file)
    setChildPreview(URL.createObjectURL(file))
  }

  async function pollStatus(jobId) {
    try {
      const res = await fetch(`${API_BASE}/api/comic-status/${jobId}`)
      if (!res.ok) throw new Error('Status check failed')
      const data = await res.json()
      setStatusData(data)
      if (data.status === 'done') {
        stopPolling()
        setStep('result')
      } else if (data.status === 'error') {
        stopPolling()
        setErrorMsg(data.error ?? 'Generation failed — please try again')
        setStep('story')
      }
    } catch (e) {
      stopPolling()
      setErrorMsg(e.message)
      setStep('story')
    }
  }

  async function handleGenerate() {
    setStep('generating')
    setErrorMsg(null)
    setStatusData({})

    const fd = new FormData()
    fd.append('mom_photo',    momFile)
    fd.append('child_photo',  childFile)
    const tpl = [...MOVIE_TEMPLATES, ...BOOK_TEMPLATES].find(t => t.id === template)
    fd.append('story_type',   tpl?.seed ?? template)
    fd.append('story_notes',  customNotes)
    fd.append('style',        style)
    fd.append('mom_name',     'Mom')
    fd.append('child_name',   childName || 'Child')

    try {
      const res = await fetch(`${API_BASE}/api/comic`, { method: 'POST', body: fd })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }))
        throw new Error(err.detail ?? 'Unknown error')
      }
      const { job_id } = await res.json()
      setJobId(job_id)
      window.history.pushState({}, '', `?comic=${job_id}`)
      pollRef.current = setInterval(() => pollStatus(job_id), POLL_MS)
      pollStatus(job_id)
    } catch (e) {
      setErrorMsg(e.message)
      setStep('story')
    }
  }

  function handleReset() {
    stopPolling()
    if (momPreview)   URL.revokeObjectURL(momPreview)
    if (childPreview) URL.revokeObjectURL(childPreview)
    window.history.replaceState({}, '', window.location.pathname)
    setStep('photos')
    setJobId(null)
    setMomFile(null);    setMomPreview(null)
    setChildFile(null);  setChildPreview(null)
    setChildName('')
    setTemplate(null);   setCustomNotes('');  setStyle('cartoon')
    setStatusData({});   setErrorMsg(null)
  }

  const canGoToStory = !!(momFile && childFile)
  const canGenerate  = !!(template && (template !== 'custom' || customNotes.trim()))

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-logo">💝 Mom &amp; Me Comics</div>
        <p className="app-tagline">A personalised Mother's Day comic book — starring the mom and her child!</p>
      </header>

      <StepBar step={step} />

      <main className="app-main">
        {step === 'photos' && (
          <PhotosStep
            momPreview={momPreview}   momFile={momFile}
            childPreview={childPreview} childFile={childFile}
            childName={childName}
            momRef={momRef}           childRef={childRef}
            onPickMom={pickMom}       onPickChild={pickChild}
            onChildName={setChildName}
            errorMsg={errorMsg}
            onNext={() => { setErrorMsg(null); setStep('story') }}
            canNext={canGoToStory}
          />
        )}
        {step === 'story' && (
          <StoryStep
            template={template}         setTemplate={setTemplate}
            customNotes={customNotes}   setCustomNotes={setCustomNotes}
            style={style}               setStyle={setStyle}
            errorMsg={errorMsg}
            onBack={() => setStep('photos')}
            onGenerate={handleGenerate}
            canGenerate={canGenerate}
          />
        )}
        {step === 'generating' && (
          <GeneratingStep statusData={statusData} onPanelClick={setLightboxUrl} />
        )}
        {step === 'result' && (
          <ResultStep
            statusData={statusData}
            childName={childName || 'Child'}
            onReset={handleReset}
            onPanelClick={setLightboxUrl}
            jobId={jobId}
          />
        )}
      </main>

      <footer className="app-footer">
        Made with 💝 for Mother's Day
      </footer>

      {lightboxUrl && (
        <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}
    </div>
  )
}
