// Constants
const ITEM_CREATE_COOLDOWN = 60; // 1 minute in seconds
const TOKEN_MINE_COOLDOWN = 180; // 3 minutes in seconds
const ITEMS_PER_PAGE = 5;
const API_BASE = 'https://api.economix.lol';
const CASINO_ANIMATION_DURATION = 2000;

const EMOJIS = ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "🫠", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "☺", "😚", "😙", "🥲", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🫢", "🫣", "🤫", "🤔", "🫡", "🤐", "🤨", "😐", "😑", "😶", "🫥", "😶‍🌫️", "😏", "😒", "🙄", "😬", "😮‍💨", "🤥", "🫨", "🙂‍↔️", "🙂‍↕️", "😌", "😔", "😪", "🤤", "😴", "🫩", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶", "🥴", "😵", "😵‍💫", "🤯", "🤠", "🥳", "🥸", "😎", "🤓", "🧐", "😕", "🫤", "😟", "🙁", "☹", "😮", "😯", "😲", "😳", "🥺", "🥹", "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬", "😈", "👿", "💀", "☠", "💩", "🤡", "👹", "👺", "👻", "👽", "👾", "🤖", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🙈", "🙉", "🙊", "💌", "💘", "💝", "💖", "💗", "💓", "💞", "💕", "💟", "❣", "💔", "❤️‍🔥", "❤️‍🩹", "❤", "🩷", "🧡", "💛", "💚", "💙", "🩵", "💜", "🤎", "🖤", "🩶", "🤍", "💋", "💯", "💢", "💥", "💫", "💦", "💨", "🕳", "💬", "👁️‍🗨️", "🗨", "🗯", "💭", "💤", "👋", "🤚", "🖐", "✋", "🖖", "🫱", "🫲", "🫳", "🫴", "🫷", "🫸", "👌", "🤌", "🤏", "✌", "🤞", "🫰", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝", "🫵", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "🫶", "👐", "🤲", "🤝", "🙏", "✍", "💅", "🤳", "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃", "🧠", "🫀", "🫁", "🦷", "🦴", "👀", "👁", "👅", "👄", "🫦", "👶", "🧒", "👦", "👧", "🧑", "👱", "👨", "🧔", "🧔‍♂️", "🧔‍♀️", "👨‍🦰", "👨‍🦱", "👨‍🦳", "👨‍🦲", "👩", "👩‍🦰", "🧑‍🦰", "👩‍🦱", "🧑‍🦱", "👩‍🦳", "🧑‍🦳", "👩‍🦲", "🧑‍🦲", "👱‍♀️", "👱‍♂️", "🧓", "👴", "👵", "🙍", "🙍‍♂️", "🙍‍♀️", "🙎", "🙎‍♂️", "🙎‍♀️", "🙅", "🙅‍♂️", "🙅‍♀️", "🙆", "🙆‍♂️", "🙆‍♀️", "💁", "💁‍♂️", "💁‍♀️", "🙋", "🙋‍♂️", "🙋‍♀️", "🧏", "🧏‍♂️", "🧏‍♀️", "🙇", "🙇‍♂️", "🙇‍♀️", "🤦", "🤦‍♂️", "🤦‍♀️", "🤷", "🤷‍♂️", "🤷‍♀️", "🧑‍⚕️", "👨‍⚕️", "👩‍⚕️", "🧑‍🎓", "👨‍🎓", "👩‍🎓", "🧑‍🏫", "👨‍🏫", "👩‍🏫", "🧑‍⚖️", "👨‍⚖️", "👩‍⚖️", "🧑‍🌾", "👨‍🌾", "👩‍🌾", "🧑‍🍳", "👨‍🍳", "👩‍🍳", "🧑‍🔧", "👨‍🔧", "👩‍🔧", "🧑‍🏭", "👨‍🏭", "👩‍🏭", "🧑‍💼", "👨‍💼", "👩‍💼", "🧑‍🔬", "👨‍🔬", "👩‍🔬", "🧑‍💻", "👨‍💻", "👩‍💻", "🧑‍🎤", "👨‍🎤", "👩‍🎤", "🧑‍🎨", "👨‍🎨", "👩‍🎨", "🧑‍✈️", "👨‍✈️", "👩‍✈️", "🧑‍🚀", "👨‍🚀", "👩‍🚀", "🧑‍🚒", "👨‍🚒", "👩‍🚒", "👮", "👮‍♂️", "👮‍♀️", "🕵", "🕵️‍♂️", "🕵️‍♀️", "💂", "💂‍♂️", "💂‍♀️", "🥷", "👷", "👷‍♂️", "👷‍♀️", "🫅", "🤴", "👸", "👳", "👳‍♂️", "👳‍♀️", "👲", "🧕", "🤵", "🤵‍♂️", "🤵‍♀️", "👰", "👰‍♂️", "👰‍♀️", "🤰", "🫃", "🫄", "🤱", "👩‍🍼", "👨‍🍼", "🧑‍🍼", "👼", "🎅", "🤶", "🧑‍🎄", "🦸", "🦸‍♂️", "🦸‍♀️", "🦹", "🦹‍♂️", "🦹‍♀️", "🧙", "🧙‍♂️", "🧙‍♀️", "🧚", "🧚‍♂️", "🧚‍♀️", "🧛", "🧛‍♂️", "🧛‍♀️", "🧜", "🧜‍♂️", "🧜‍♀️", "🧝", "🧝‍♂️", "🧝‍♀️", "🧞", "🧞‍♂️", "🧞‍♀️", "🧟", "🧟‍♂️", "🧟‍♀️", "🧌", "💆", "💆‍♂️", "💆‍♀️", "💇", "💇‍♂️", "💇‍♀️", "🚶", "🚶‍♂️", "🚶‍♀️", "🚶‍➡️", "🚶‍♀️‍➡️", "🚶‍♂️‍➡️", "🧍", "🧍‍♂️", "🧍‍♀️", "🧎", "🧎‍♂️", "🧎‍♀️", "🧎‍➡️", "🧎‍♀️‍➡️", "🧎‍♂️‍➡️", "🧑‍🦯", "🧑‍🦯‍➡️", "👨‍🦯", "👨‍🦯‍➡️", "👩‍🦯", "👩‍🦯‍➡️", "🧑‍🦼", "🧑‍🦼‍➡️", "👨‍🦼", "👨‍🦼‍➡️", "👩‍🦼", "👩‍🦼‍➡️", "🧑‍🦽", "🧑‍🦽‍➡️", "👨‍🦽", "👨‍🦽‍➡️", "👩‍🦽", "👩‍🦽‍➡️", "🏃", "🏃‍♂️", "🏃‍♀️", "🏃‍➡️", "🏃‍♀️‍➡️", "🏃‍♂️‍➡️", "💃", "🕺", "🕴", "👯", "👯‍♂️", "👯‍♀️", "🧖", "🧖‍♂️", "🧖‍♀️", "🧗", "🧗‍♂️", "🧗‍♀️", "🤺", "🏇", "⛷", "🏂", "🏌", "🏌️‍♂️", "🏌️‍♀️", "🏄", "🏄‍♂️", "🏄‍♀️", "🚣", "🚣‍♂️", "🚣‍♀️", "🏊", "🏊‍♂️", "🏊‍♀️", "⛹", "⛹️‍♂️", "⛹️‍♀️", "🏋", "🏋️‍♂️", "🏋️‍♀️", "🚴", "🚴‍♂️", "🚴‍♀️", "🚵", "🚵‍♂️", "🚵‍♀️", "🤸", "🤸‍♂️", "🤸‍♀️", "🤼", "🤼‍♂️", "🤼‍♀️", "🤽", "🤽‍♂️", "🤽‍♀️", "🤾", "🤾‍♂️", "🤾‍♀️", "🤹", "🤹‍♂️", "🤹‍♀️", "🧘", "🧘‍♂️", "🧘‍♀️", "🛀", "🛌", "🧑‍🤝‍🧑", "👭", "👫", "👬", "💏", "👩‍❤️‍💋‍👨", "👨‍❤️‍💋‍👨", "👩‍❤️‍💋‍👩", "💑", "👩‍❤️‍👨", "👨‍❤️‍👨", "👩‍❤️‍👩", "👨‍👩‍👦", "👨‍👩‍👧", "👨‍👩‍👧‍👦", "👨‍👩‍👦‍👦", "👨‍👩‍👧‍👧", "👨‍👨‍👦", "👨‍👨‍👧", "👨‍👨‍👧‍👦", "👨‍👨‍👦‍👦", "👨‍👨‍👧‍👧", "👩‍👩‍👦", "👩‍👩‍👧", "👩‍👩‍👧‍👦", "👩‍👩‍👦‍👦", "👩‍👩‍👧‍👧", "👨‍👦", "👨‍👦‍👦", "👨‍👧", "👨‍👧‍👦", "👨‍👧‍👧", "👩‍👦", "👩‍👦‍👦", "👩‍👧", "👩‍👧‍👦", "👩‍👧‍👧", "🗣", "👤", "👥", "🫂", "👪", "🧑‍🧑‍🧒", "🧑‍🧑‍🧒‍🧒", "🧑‍🧒", "🧑‍🧒‍🧒", "👣", "🫆", "🦰", "🦱", "🦳", "🦲", "🐵", "🐒", "🦍", "🦧", "🐶", "🐕", "🦮", "🐕‍🦺", "🐩", "🐺", "🦊", "🦝", "🐱", "🐈", "🐈‍⬛", "🦁", "🐯", "🐅", "🐆", "🐴", "🫎", "🫏", "🐎", "🦄", "🦓", "🦌", "🦬", "🐮", "🐂", "🐃", "🐄", "🐷", "🐖", "🐗", "🐽", "🐏", "🐑", "🐐", "🐪", "🐫", "🦙", "🦒", "🐘", "🦣", "🦏", "🦛", "🐭", "🐁", "🐀", "🐹", "🐰", "🐇", "🐿", "🦫", "🦔", "🦇", "🐻", "🐻‍❄️", "🐨", "🐼", "🦥", "🦦", "🦨", "🦘", "🦡", "🐾", "🦃", "🐔", "🐓", "🐣", "🐤", "🐥", "🐦", "🐧", "🕊", "🦅", "🦆", "🦢", "🦉", "🦤", "🪶", "🦩", "🦚", "🦜", "🪽", "🐦‍⬛", "🪿", "🐦‍🔥", "🐸", "🐊", "🐢", "🦎", "🐍", "🐲", "🐉", "🦕", "🦖", "🐳", "🐋", "🐬", "🦭", "🐟", "🐠", "🐡", "🦈", "🐙", "🐚", "🪸", "🪼", "🦀", "🦞", "🦐", "🦑", "🦪", "🐌", "🦋", "🐛", "🐜", "🐝", "🪲", "🐞", "🦗", "🪳", "🕷", "🕸", "🦂", "🦟", "🪰", "🪱", "🦠", "💐", "🌸", "💮", "🪷", "🏵", "🌹", "🥀", "🌺", "🌻", "🌼", "🌷", "🪻", "🌱", "🪴", "🌲", "🌳", "🌴", "🌵", "🌾", "🌿", "☘", "🍀", "🍁", "🍂", "🍃", "🪹", "🪺", "🍄", "🪾", "🍇", "🍈", "🍉", "🍊", "🍋", "🍋‍🟩", "🍌", "🍍", "🥭", "🍎", "🍏", "🍐", "🍑", "🍒", "🍓", "🫐", "🥝", "🍅", "🫒", "🥥", "🥑", "🍆", "🥔", "🥕", "🌽", "🌶", "🫑", "🥒", "🥬", "🥦", "🧄", "🧅", "🥜", "🫘", "🌰", "🫚", "🫛", "🍄‍🟫", "🫜", "🍞", "🥐", "🥖", "🫓", "🥨", "🥯", "🥞", "🧇", "🧀", "🍖", "🍗", "🥩", "🥓", "🍔", "🍟", "🍕", "🌭", "🥪", "🌮", "🌯", "🫔", "🥙", "🧆", "🥚", "🍳", "🥘", "🍲", "🫕", "🥣", "🥗", "🍿", "🧈", "🧂", "🥫", "🍱", "🍘", "🍙", "🍚", "🍛", "🍜", "🍝", "🍠", "🍢", "🍣", "🍤", "🍥", "🥮", "🍡", "🥟", "🥠", "🥡", "🍦", "🍧", "🍨", "🍩", "🍪", "🎂", "🍰", "🧁", "🥧", "🍫", "🍬", "🍭", "🍮", "🍯", "🍼", "🥛", "☕", "🫖", "🍵", "🍶", "🍾", "🍷", "🍸", "🍹", "🍺", "🍻", "🥂", "🥃", "🫗", "🥤", "🧋", "🧃", "🧉", "🧊", "🥢", "🍽", "🍴", "🥄", "🔪", "🫙", "🏺", "🌍", "🌎", "🌏", "🌐", "🗺", "🗾", "🧭", "🏔", "⛰", "🌋", "🗻", "🏕", "🏖", "🏜", "🏝", "🏞", "🏟", "🏛", "🏗", "🧱", "🪨", "🪵", "🛖", "🏘", "🏚", "🏠", "🏡", "🏢", "🏣", "🏤", "🏥", "🏦", "🏨", "🏩", "🏪", "🏫", "🏬", "🏭", "🏯", "🏰", "💒", "🗼", "🗽", "⛪", "🕌", "🛕", "🕍", "⛩", "🕋", "⛲", "⛺", "🌁", "🌃", "🏙", "🌄", "🌅", "🌆", "🌇", "🌉", "♨", "🎠", "🛝", "🎡", "🎢", "💈", "🎪", "🚂", "🚃", "🚄", "🚅", "🚆", "🚇", "🚈", "🚉", "🚊", "🚝", "🚞", "🚋", "🚌", "🚍", "🚎", "🚐", "🚑", "🚒", "🚓", "🚔", "🚕", "🚖", "🚗", "🚘", "🚙", "🛻", "🚚", "🚛", "🚜", "🏎", "🏍", "🛵", "🦽", "🦼", "🛺", "🚲", "🛴", "🛹", "🛼", "🚏", "🛣", "🛤", "🛢", "⛽", "🛞", "🚨", "🚥", "🚦", "🛑", "🚧", "⚓", "🛟", "⛵", "🛶", "🚤", "🛳", "⛴", "🛥", "🚢", "✈", "🛩", "🛫", "🛬", "🪂", "💺", "🚁", "🚟", "🚠", "🚡", "🛰", "🚀", "🛸", "🛎", "🧳", "⌛", "⏳", "⌚", "⏰", "⏱", "⏲", "🕰", "🕛", "🕧", "🕐", "🕜", "🕑", "🕝", "🕒", "🕞", "🕓", "🕟", "🕔", "🕠", "🕕", "🕡", "🕖", "🕢", "🕗", "🕣", "🕘", "🕤", "🕙", "🕥", "🕚", "🕦", "🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘", "🌙", "🌚", "🌛", "🌜", "🌡", "☀", "🌝", "🌞", "🪐", "⭐", "🌟", "🌠", "🌌", "☁", "⛅", "⛈", "🌤", "🌥", "🌦", "🌧", "🌨", "🌩", "🌪", "🌫", "🌬", "🌀", "🌈", "🌂", "☂", "☔", "⛱", "⚡", "❄", "☃", "⛄", "☄", "🔥", "💧", "🌊", "🎃", "🎄", "🎆", "🎇", "🧨", "✨", "🎈", "🎉", "🎊", "🎋", "🎍", "🎎", "🎏", "🎐", "🎑", "🧧", "🎀", "🎁", "🎗", "🎟", "🎫", "🎖", "🏆", "🏅", "🥇", "🥈", "🥉", "⚽", "⚾", "🥎", "🏀", "🏐", "🏈", "🏉", "🎾", "🥏", "🎳", "🏏", "🏑", "🏒", "🥍", "🏓", "🏸", "🥊", "🥋", "🥅", "⛳", "⛸", "🎣", "🤿", "🎽", "🎿", "🛷", "🥌", "🎯", "🪀", "🪁", "🔫", "🎱", "🔮", "🪄", "🎮", "🕹", "🎰", "🎲", "🧩", "🧸", "🪅", "🪩", "🪆", "♠", "♥", "♦", "♣", "♟", "🃏", "🀄", "🎴", "🎭", "🖼", "🎨", "🧵", "🪡", "🧶", "🪢", "👓", "🕶", "🥽", "🥼", "🦺", "👔", "👕", "👖", "🧣", "🧤", "🧥", "🧦", "👗", "👘", "🥻", "🩱", "🩲", "🩳", "👙", "👚", "🪭", "👛", "👜", "👝", "🛍", "🎒", "🩴", "👞", "👟", "🥾", "🥿", "👠", "👡", "🩰", "👢", "🪮", "👑", "👒", "🎩", "🎓", "🧢", "🪖", "⛑", "📿", "💄", "💍", "💎", "🔇", "🔈", "🔉", "🔊", "📢", "📣", "📯", "🔔", "🔕", "🎼", "🎵", "🎶", "🎙", "🎚", "🎛", "🎤", "🎧", "📻", "🎷", "🪗", "🎸", "🎹", "🎺", "🎻", "🪕", "🥁", "🪘", "🪇", "🪈", "🪉", "📱", "📲", "☎", "📞", "📟", "📠", "🔋", "🪫", "🔌", "💻", "🖥", "🖨", "⌨", "🖱", "🖲", "💽", "💾", "💿", "📀", "🧮", "🎥", "🎞", "📽", "🎬", "📺", "📷", "📸", "📹", "📼", "🔍", "🔎", "🕯", "💡", "🔦", "🏮", "🪔", "📔", "📕", "📖", "📗", "📘", "📙", "📚", "📓", "📒", "📃", "📜", "📄", "📰", "🗞", "📑", "🔖", "🏷", "💰", "🪙", "💴", "💵", "💶", "💷", "💸", "💳", "🧾", "💹", "✉", "📧", "📨", "📩", "📤", "📥", "📦", "📫", "📪", "📬", "📭", "📮", "🗳", "✏", "✒", "🖋", "🖊", "🖌", "🖍", "📝", "💼", "📁", "📂", "🗂", "📅", "📆", "🗒", "🗓", "📇", "📈", "📉", "📊", "📋", "📌", "📍", "📎", "🖇", "📏", "📐", "✂", "🗃", "🗄", "🗑", "🔒", "🔓", "🔏", "🔐", "🔑", "🗝", "🔨", "🪓", "⛏", "⚒", "🛠", "🗡", "⚔", "💣", "🪃", "🏹", "🛡", "🪚", "🔧", "🪛", "🔩", "⚙", "🗜", "⚖", "🦯", "🔗", "⛓️‍💥", "⛓", "🪝", "🧰", "🧲", "🪜", "🪏", "⚗", "🧪", "🧫", "🧬", "🔬", "🔭", "📡", "💉", "🩸", "💊", "🩹", "🩼", "🩺", "🩻", "🚪", "🛗", "🪞", "🪟", "🛏", "🛋", "🪑", "🚽", "🪠", "🚿", "🛁", "🪤", "🪒", "🧴", "🧷", "🧹", "🧺", "🧻", "🪣", "🧼", "🫧", "🪥", "🧽", "🧯", "🛒", "🚬", "⚰", "🪦", "⚱", "🧿", "🪬", "🗿", "🪧", "🪪", "🏧", "🚮", "🚰", "♿", "🚹", "🚺", "🚻", "🚼", "🚾", "🛂", "🛃", "🛄", "🛅", "⚠", "🚸", "⛔", "🚫", "🚳", "🚭", "🚯", "🚱", "🚷", "📵", "🔞", "☢", "☣", "⬆", "↗", "➡", "↘", "⬇", "↙", "⬅", "↖", "↕", "↔", "↩", "↪", "⤴", "⤵", "🔃", "🔄", "🔙", "🔚", "🔛", "🔜", "🔝", "🛐", "⚛", "🕉", "✡", "☸", "☯", "✝", "☦", "☪", "☮", "🕎", "🔯", "🪯", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓", "⛎", "🔀", "🔁", "🔂", "▶", "⏩", "⏭", "⏯", "◀", "⏪", "⏮", "🔼", "⏫", "🔽", "⏬", "⏸", "⏹", "⏺", "⏏", "🎦", "🔅", "🔆", "📶", "🛜", "📳", "📴", "♀", "♂", "⚧", "✖", "➕", "➖", "➗", "🟰", "♾", "‼", "⁉", "❓", "❔", "❕", "❗", "〰", "💱", "💲", "⚕", "♻", "⚜", "🔱", "📛", "🔰", "⭕", "✅", "☑", "✔", "❌", "❎", "➰", "➿", "〽", "✳", "✴", "❇", "©", "®", "™", "🫟", "#️⃣", "*️⃣", "0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟", "🔠", "🔡", "🔢", "🔣", "🔤", "🅰", "🆎", "🅱", "🆑", "🆒", "🆓", "ℹ", "🆔", "Ⓜ", "🆕", "🆖", "🅾", "🆗", "🅿", "🆘", "🆙", "🆚", "🈁", "🈂", "🈷", "🈶", "🈯", "🉐", "🈹", "🈚", "🈲", "🉑", "🈸", "🈴", "🈳", "㊗", "㊙", "🈺", "🈵", "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "🟤", "⚫", "⚪", "🟥", "🟧", "🟨", "🟩", "🟦", "🟪", "🟫", "⬛", "⬜", "◼", "◻", "◾", "◽", "▪", "▫", "🔶", "🔷", "🔸", "🔹", "🔺", "🔻", "💠", "🔘", "🔳", "🔲", "🏁", "🚩", "🎌", "🏴", "🏳", "🏳️‍🌈", "🏳️‍⚧️", "🏴‍☠️", "🇦🇨", "🇦🇩", "🇦🇪", "🇦🇫", "🇦🇬", "🇦🇮", "🇦🇱", "🇦🇲", "🇦🇴", "🇦🇶", "🇦🇷", "🇦🇸", "🇦🇹", "🇦🇺", "🇦🇼", "🇦🇽", "🇦🇿", "🇧🇦", "🇧🇧", "🇧🇩", "🇧🇪", "🇧🇫", "🇧🇬", "🇧🇭", "🇧🇮", "🇧🇯", "🇧🇱", "🇧🇲", "🇧🇳", "🇧🇴", "🇧🇶", "🇧🇷", "🇧🇸", "🇧🇹", "🇧🇻", "🇧🇼", "🇧🇾", "🇧🇿", "🇨🇦", "🇨🇨", "🇨🇩", "🇨🇫", "🇨🇬", "🇨🇭", "🇨🇮", "🇨🇰", "🇨🇱", "🇨🇲", "🇨🇳", "🇨🇴", "🇨🇵", "🇨🇶", "🇨🇷", "🇨🇺", "🇨🇻", "🇨🇼", "🇨🇽", "🇨🇾", "🇨🇿", "🇩🇪", "🇩🇬", "🇩🇯", "🇩🇰", "🇩🇲", "🇩🇴", "🇩🇿", "🇪🇦", "🇪🇨", "🇪🇪", "🇪🇬", "🇪🇭", "🇪🇷", "🇪🇸", "🇪🇹", "🇪🇺", "🇫🇮", "🇫🇯", "🇫🇰", "🇫🇲", "🇫🇴", "🇫🇷", "🇬🇦", "🇬🇧", "🇬🇩", "🇬🇪", "🇬🇫", "🇬🇬", "🇬🇭", "🇬🇮", "🇬🇱", "🇬🇲", "🇬🇳", "🇬🇵", "🇬🇶", "🇬🇷", "🇬🇸", "🇬🇹", "🇬🇺", "🇬🇼", "🇬🇾", "🇭🇰", "🇭🇲", "🇭🇳", "🇭🇷", "🇭🇹", "🇭🇺", "🇮🇨", "🇮🇩", "🇮🇪", "🇮🇱", "🇮🇲", "🇮🇳", "🇮🇴", "🇮🇶", "🇮🇷", "🇮🇸", "🇮🇹", "🇯🇪", "🇯🇲", "🇯🇴", "🇯🇵", "🇰🇪", "🇰🇬", "🇰🇭", "🇰🇮", "🇰🇲", "🇰🇳", "🇰🇵", "🇰🇷", "🇰🇼", "🇰🇾", "🇰🇿", "🇱🇦", "🇱🇧", "🇱🇨", "🇱🇮", "🇱🇰", "🇱🇷", "🇱🇸", "🇱🇹", "🇱🇺", "🇱🇻", "🇱🇾", "🇲🇦", "🇲🇨", "🇲🇩", "🇲🇪", "🇲🇫", "🇲🇬", "🇲🇭", "🇲🇰", "🇲🇱", "🇲🇲", "🇲🇳", "🇲🇴", "🇲🇵", "🇲🇶", "🇲🇷", "🇲🇸", "🇲🇹", "🇲🇺", "🇲🇻", "🇲🇼", "🇲🇽", "🇲🇾", "🇲🇿", "🇳🇦", "🇳🇨", "🇳🇪", "🇳🇫", "🇳🇬", "🇳🇮", "🇳🇱", "🇳🇴", "🇳🇵", "🇳🇷", "🇳🇺", "🇳🇿", "🇴🇲", "🇵🇦", "🇵🇪", "🇵🇫", "🇵🇬", "🇵🇭", "🇵🇰", "🇵🇱", "🇵🇲", "🇵🇳", "🇵🇷", "🇵🇸", "🇵🇹", "🇵🇼", "🇵🇾", "🇶🇦", "🇷🇪", "🇷🇴", "🇷🇸", "🇷🇺", "🇷🇼", "🇸🇦", "🇸🇧", "🇸🇨", "🇸🇩", "🇸🇪", "🇸🇬", "🇸🇭", "🇸🇮", "🇸🇯", "🇸🇰", "🇸🇱", "🇸🇲", "🇸🇳", "🇸🇴", "🇸🇷", "🇸🇸", "🇸🇹", "🇸🇻", "🇸🇽", "🇸🇾", "🇸🇿", "🇹🇦", "🇹🇨", "🇹🇩", "🇹🇫", "🇹🇬", "🇹🇭", "🇹🇯", "🇹🇰", "🇹🇱", "🇹🇲", "🇹🇳", "🇹🇴", "🇹🇷", "🇹🇹", "🇹🇻", "🇹🇼", "🇹🇿", "🇺🇦", "🇺🇬", "🇺🇲", "🇺🇳", "🇺🇸", "🇺🇾", "🇺🇿", "🇻🇦", "🇻🇨", "🇻🇪", "🇻🇬", "🇻🇮", "🇻🇳", "🇻🇺", "🇼🇫", "🇼🇸", "🇽🇰", "🇾🇪", "🇾🇹", "🇿🇦", "🇿🇲", "🇿🇼", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "🏴󠁧󠁢󠁷󠁬󠁿"];

// Utils
function expForLevel(level) {
  return Math.floor(25 * Math.pow(1.2, level - 1));
}

// State Management
class AppState {
  constructor() {
    this.inventoryPage = 1;
    this.marketPage = 1;
    this.token = localStorage.getItem('token') || null;
    this.items = [];
    this.pets = [];
    this.oldPets = [];
    this.globalMessages = [];
    this.account = {};
    this.marketItems = [];
    this.unreadMessages = 0;
    this.isChatFocused = true;
    this.typingUsers = [];
    this.onlineUsers = [];

    // Inventory Filters
    this.inventoryFilters = {
      searchQuery: '',
      rarity: '',
      sale: 'all'
    };

    // Market Filters
    this.marketFilters = {
      searchQuery: '',
      rarity: '',
      priceMin: '',
      priceMax: '',
      seller: ''
    };
  }
}

const state = new AppState();

// Modal Utilities
const Modal = {
  show(modal) {
    modal.style.display = 'block';
  },
  hide(modal) {
    modal.style.display = 'none';
  },
  getElements() {
    return {
      modal: document.getElementById('customModal'),
      message: document.getElementById('modalMessage'),
      inputContainer: document.getElementById('modalInputContainer'),
      input: document.getElementById('modalInput'),
      ok: document.getElementById('modalOk'),
      cancel: document.getElementById('modalCancel'),
      close: document.getElementById('modalClose')
    };
  },

  alert(message) {
    return new Promise(resolve => {
      const { modal, message: msgEl, inputContainer, ok, cancel, close } = this.getElements();
      msgEl.innerHTML = message;
      inputContainer.style.display = 'none';
      cancel.style.display = 'none';
      this.show(modal);

      const closeHandler = () => {
        this.hide(modal);
        resolve();
      };

      ok.onclick = closeHandler;
      close.onclick = closeHandler;
    });
  },

  prompt(message) {
    return new Promise(resolve => {
      const { modal, message: msgEl, inputContainer, input, ok, cancel, close } = this.getElements();
      msgEl.textContent = message;
      inputContainer.style.display = 'block';
      input.value = '';
      cancel.style.display = 'inline-block';
      this.show(modal);

      ok.onclick = () => {
        this.hide(modal);
        resolve(input.value);
      };
      cancel.onclick = close.onclick = () => {
        this.hide(modal);
        resolve(null);
      };
    });
  },

  confirm(message) {
    return new Promise(resolve => {
      const { modal, message: msgEl, inputContainer, ok, cancel, close } = this.getElements();
      msgEl.textContent = message;
      inputContainer.style.display = 'none';
      ok.style.display = 'inline-block';
      cancel.style.display = 'inline-block';
      this.show(modal);

      ok.onclick = () => {
        this.hide(modal);
        resolve(true);
      };
      cancel.onclick = close.onclick = () => {
        this.hide(modal);
        resolve(false);
      };
    });
  }
};

// UI Utilities
const UI = {
  switchTab(tabName) {
    const chatTab = document.querySelector('[data-tab="chat"]');
    state.isChatFocused = tabName === 'chat';
    if (state.isChatFocused) {
      state.unreadMessages = 0;
      chatTab.classList.remove('new-messages');
    }

    document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
  },

  toggleVisibility(elementId, display = 'block') {
    document.getElementById(elementId).style.display = display;
  },

  showAuthForms() {
    if (state.token) {
      UI.toggleVisibility('homepage', 'none');
      UI.toggleVisibility('mainContent');
      Auth.refreshAccount();
    } else {
      UI.toggleVisibility('homepage', 'none');
      UI.toggleVisibility('authForms');
    }
  },

  formatTime(timestamp) {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  },

  setTheme(theme) {
    const availableThemes = ['light', 'dark', 'sepia', 'solarized', 'nord', 'dracula', 'monokai', 'gruvbox', 'oceanic', 'pastel', 'cyberpunk', 'tokyonight'];
    if (!availableThemes.includes(theme)) {
      theme = 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
      themeSelect.value = theme;
    }
  },

  initializeTheme() {
    let theme = localStorage.getItem('theme') || 'light';
    this.setTheme(theme);
  },
};

// API Utilities
const API = {
  async fetch(endpoint, options = {}) {
    try {
      const headers = {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      };
      const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

      if (!response.ok) {
        return { error: response?.error || `API error: ${response.status}`, success: false };
      }

      let json = await response.json();
      return { ...json, success: true };
    } catch (err) {
      return { error: err.message, success: false };
    }
  },

  async post(endpoint, data) {
    return this.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async get(endpoint) {
    return this.fetch(endpoint, { method: 'GET' });
  }
};

// Authentication Handlers
const Auth = {
  async login(code) {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const body = { username, password, ...(code && (code.length === 6 ? { token: code } : { code })) };

    try {
      const data = await API.post('/api/login', body);
      if (data.code === '2fa-required') {
        const codeInput = await Modal.prompt('Enter 2FA code or Backup code:');
        if (codeInput) await this.login(codeInput);
        else location.reload();
        return;
      }
      if (data.token) {
        localStorage.setItem('token', data.token);
        state.token = data.token;
        UI.toggleVisibility('authForms', 'none');
        UI.toggleVisibility('mainContent');
        await this.refreshAccount();
      }
    } catch (error) {
      await Modal.alert(`Login failed: ${error.message}. Report at GitHub/Discord if persistent.`);
    }
  },

  async register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    const data = await API.post('/api/register', { username, password });
    await Modal.alert(data.success ? 'Registration successful! Please login.' : `Registration failed: ${data.error || 'Unknown error'}`);
  },

  async setup2FA() {
    const data = await API.post('/api/setup_2fa');
    if (!data.success) return await Modal.alert(`Error setting up 2FA: ${data.error}`);

    const blob = await (await fetch(`${API_BASE}/api/2fa_qrcode`, { headers: { 'Authorization': `Bearer ${state.token}` } })).blob();
    document.getElementById('2faQrCode').src = URL.createObjectURL(blob);
    document.getElementById('2faQrCode').style.display = 'block';
    UI.toggleVisibility('mainContent', 'none');
    UI.toggleVisibility('2faSetupPage');
  },

  async enable2FA() {
    const code = document.getElementById('2faCode').value;
    const data = await API.post('/api/verify_2fa', { token: code });
    if (data.success) await Modal.alert(`2FA enabled! Backup code: ${backupCode}`).then(() => location.reload());
    else await Modal.alert('Failed to enable 2FA.');
  },

  async disable2FA() {
    const data = await API.post('/api/disable_2fa');
    if (data.success) await Modal.alert('2FA disabled!').then(() => location.reload());
    else await Modal.alert('Failed to disable 2FA.');
  },

  async deleteAccount() {
    const confirmation = await Modal.prompt("Enter 'CONFIRM' to delete your account:");
    if (confirmation !== 'CONFIRM') return;

    const data = await API.post('/api/delete_account');
    if (data.success) {
      localStorage.removeItem('token');
      location.reload();
    } else await Modal.alert('Failed to delete account.');
  },

  async redeemCreatorCode() {
    const code = await Modal.prompt('Enter code:');
    if (!code) return;
    const data = await API.post('/api/redeem_creator_code', { code });
    await Modal.alert(data.success ? `Creator code redeemed! Extra tokens: ${data.extra_tokens} | Extra pets: ${data.extra_pets}` : 'Error redeeming creator code.');
  },

  async sendTokens() {
    const recipient = await Modal.prompt('Enter recipient:');
    if (!recipient) return;
    const amount = await Modal.prompt('Enter amount:');
    if (!amount) return;
    const data = await API.post('/api/send_tokens', { recipient, amount });
    await Modal.alert(data.success ? `Sent tokens!` : `Error sending tokens.`);
  },

  async refreshAccount() {
    const data = await API.get('/api/account');

    if (data.banned) {
      UI.toggleVisibility('mainContent', 'none');
      UI.toggleVisibility('bannedPage');
      document.getElementById('banExpires').textContent = data.banned_until === 0 ? 'Permanent' : new Date(data.banned_until * 1000).toLocaleString();
      document.getElementById('banReason').textContent = data.banned_reason;
      return;
    }

    if (data.creator_code) {
      document.getElementById('creatorCodeMessage').textContent = data.creator_code;
      UI.toggleVisibility('creatorMessage');
    }

    if (data.error) {
      Sounds.error.play();
      localStorage.removeItem('token');
      location.reload();
      return;
    }

    this.updateAccountUI(data);
    state.items = data.items;
    state.oldPets = state.pets;
    state.pets = data.pets;
    state.account = data;

    if ((state.inventoryPage - 1) * ITEMS_PER_PAGE >= state.items.length) state.inventoryPage = 1;
    Inventory.render(Inventory.filter(state.items));
    Pets.render(state.pets);
  },

  updateAccountUI(data) {
    document.getElementById('tokens').textContent = data.tokens;
    document.getElementById('level').textContent = data.level;
    document.getElementById('usernameDisplay').textContent = data.username;

    const roleDisplay = document.getElementById('roleDisplay');
    const adminTab = document.getElementById('adminDashboardTabButton');
    const modTab = document.getElementById('modDashboardTabButton');
    const activeTab = document.querySelector('.tab.active').getAttribute('data-tab');

    if (data.type === 'admin') {
      roleDisplay.innerHTML = 'You are an <strong>Admin</strong>';
      adminTab.style.display = 'inline-block';
      modTab.style.display = 'none';
      if (activeTab === 'modDashboard') UI.switchTab('dashboard');
    } else if (data.type === 'mod') {
      roleDisplay.innerHTML = 'You are a <strong>Mod</strong>';
      modTab.style.display = 'inline-block';
      adminTab.style.display = 'none';
      if (['modDashboard'].includes(activeTab)) UI.switchTab('dashboard');
    } else {
      roleDisplay.innerHTML = 'You are a <strong>User</strong>';
      adminTab.style.display = 'none';
      modTab.style.display = 'none';
      if (['adminDashboard', 'modDashboard'].includes(activeTab)) UI.switchTab('dashboard');
    }

    // Update EXP progress bar and text
    const expProgress = document.getElementById('expProgress');
    const expText = document.getElementById('expText');
    const expNeeded = expForLevel(data.level + 1);
    const expPercentage = (data.exp / expNeeded) * 100;

    expProgress.style.width = `${expPercentage}%`;
    expText.textContent = `${data.exp}/${expNeeded} EXP`;

    this.updateCooldowns(data);
  },

  updateCooldowns(data) {
    const now = Date.now() / 1000;
    const itemRemaining = ITEM_CREATE_COOLDOWN - (now - data.last_item_time);
    document.getElementById('cooldown').innerHTML = itemRemaining > 0
      ? `Item creation cooldown: ${Math.ceil(itemRemaining)}s${data.type === 'admin' ? ' <a href="#" onclick="Admin.resetCooldown()">Skip?</a>' : ''}`
      : '';

    const mineRemaining = TOKEN_MINE_COOLDOWN - (now - data.last_mine_time);
    document.getElementById('mineCooldown').innerHTML = mineRemaining > 0
      ? `Mining cooldown: ${Math.ceil(mineRemaining)}s${data.type === 'admin' ? ' <a href="#" onclick="Admin.resetCooldown()">Skip?</a>' : ''}`
      : '';
  }
};

// Inventory Management
const Inventory = {
  filter(items) {
    const { searchQuery, rarity, sale } = state.inventoryFilters;
    return items.filter(item => {
      const fullName = `${item.name.adjective} ${item.name.material} ${item.name.noun} ${item.name.suffix} #${item.name.number}`.toLowerCase();
      return fullName.includes(searchQuery) &&
        (!rarity || item.level === rarity) &&
        (sale === 'all' || (sale === 'forsale' ? item.for_sale : !item.for_sale));
    });
  },

  applyFilters() {
    const oldFilters = { ...state.inventoryFilters };
    state.inventoryFilters.searchQuery = document.getElementById('inventorySearch').value.toLowerCase();
    state.inventoryFilters.rarity = document.getElementById('inventoryRarityFilter').value;
    state.inventoryFilters.sale = document.getElementById('inventorySaleFilter').value;

    if (JSON.stringify(oldFilters) !== JSON.stringify(state.inventoryFilters)) state.inventoryPage = 1;
    this.render(this.filter(state.items));
  },

  render(filteredItems) {
    const itemsList = document.getElementById('itemsList');
    itemsList.innerHTML = '';
    const start = (state.inventoryPage - 1) * ITEMS_PER_PAGE;
    const pagedItems = filteredItems.slice(start, start + ITEMS_PER_PAGE);

    pagedItems.forEach(item => {
      const li = document.createElement('li');
      li.className = 'item-entry';
      li.innerHTML = `
                <span class="item-info">
                    ${item.name.icon} ${item.name.adjective} ${item.name.material} ${item.name.noun} ${item.name.suffix} #${item.name.number}
                    <span class="item-meta">(${item.rarity} Lv.${item.level})</span>
                    ${item.for_sale ? `<span class="sale-indicator">💰 Selling for ${item.price} tokens</span>` : ''}
                </span>
            `;

      const actions = document.createElement('div');
      actions.className = 'item-actions';
      actions.appendChild(this.createButton(item.for_sale ? '🚫 Cancel' : '💰 Sell', item.for_sale ? 'btn-warning' : 'btn-secondary', () => item.for_sale ? this.cancelSale(item.id) : this.sell(item.id)));
      actions.appendChild(this.createButton('🕵️ Secret', 'btn-danger', () => this.viewSecret(item.id)));
      actions.appendChild(this.createButton('♻️ Recycle (+5 tokens)', 'btn-primary', () => this.recycle(item.id)));

      if (state.account.type === 'admin') {
        actions.appendChild(this.createButton('✏️ Edit', 'btn-admin', () => Admin.editItem(item.id)));
        actions.appendChild(this.createButton('🗑️ Delete', 'btn-admin-danger', () => Admin.deleteItem(item.id)));
      }

      li.appendChild(actions);
      itemsList.appendChild(li);
    });

    this.renderPagination(filteredItems);
  },

  createButton(text, className, onClick) {
    const btn = document.createElement('button');
    btn.className = `btn ${className}`;
    btn.innerHTML = text;
    btn.onclick = onClick;
    return btn;
  },

  renderPagination(filteredItems) {
    const container = document.getElementById('inventoryPagination');
    container.innerHTML = '';
    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

    container.appendChild(this.createPaginationButton('◀ Previous', state.inventoryPage === 1, () => state.inventoryPage > 1 && (state.inventoryPage--, this.render(filteredItems))));
    const pageInfo = document.createElement('span');
    pageInfo.className = 'pagination-info';
    pageInfo.innerHTML = `Page <strong>${state.inventoryPage}</strong> of <strong>${totalPages}</strong> (${filteredItems.length} items total)`;
    container.appendChild(pageInfo);
    container.appendChild(this.createPaginationButton('Next ▶', state.inventoryPage >= totalPages, () => state.inventoryPage < totalPages && (state.inventoryPage++, this.render(filteredItems))));
  },

  createPaginationButton(text, disabled, onClick) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-pagination';
    btn.innerHTML = text;
    btn.disabled = disabled;
    btn.onclick = onClick;
    return btn;
  },

  async create() {
    const item = await API.post('/api/create_item');
    if (item.error) {
      Sounds.error.play();
      return await Modal.alert(`Error creating item: ${item.error}`);
    }
    Sounds.itemCreate.play();

    const style = window.getComputedStyle(document.body);
    let itemDiv = document.createElement("DIV");

    let h2 = document.createElement("h2")
    h2.innerText += "New " + rarity + " item!";

    // In Inventory.create
    const rarity = item.level.toLowerCase();
    if (["rare", "epic", "legendary", "godlike"].includes(rarity)) {
      const colors = {
        rare: ['#0000ff', '#00ffff'],
        epic: ['#bd1fdd', '#ff00ff'],
        legendary: ['#ffa500', '#ffff00'],
        godlike: ['#ffff00', '#ffffff']
      };

      confetti({
        particleCount: 200,
        spread: rarity === 'godlike' ? 360 : 180,
        colors: colors[rarity],
        origin: { x: 0.5, y: 0 },
        shapes: ['circle', 'star']
      });

      if (rarity === 'godlike') {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            angle: 60,
            spread: 120,
            origin: { x: 0, y: 0.7 }
          });
          confetti({
            particleCount: 100,
            angle: 120,
            spread: 120,
            origin: { x: 1, y: 0.7 }
          });
        }, 250);
      }
    }

    itemDiv.appendChild(h2)

    let p = document.createElement("P")
    p.innerText = `${item.name.icon} ${item.name.adjective} ${item.name.material} ${item.name.noun} ${item.name.suffix} #${item.name.number}`
    itemDiv.appendChild(p)

    await Modal.alert(itemDiv.innerHTML).then(() => Auth.refreshAccount());
  },

  async sell(itemId) {
    const price = await Modal.prompt('Enter sale price (tokens):');
    if (!price) return;
    const data = await API.post('/api/sell_item', { item_id: itemId, price: parseInt(price) });
    await Modal.alert(data.success ? 'Item listed for sale!' : 'Error listing item.').then(() => {
      if (data.success) {
        Auth.refreshAccount();
        Market.refresh();
      }
    });
  },

  async cancelSale(itemId) {
    const data = await API.post('/api/sell_item', { item_id: itemId, price: 1 });
    await Modal.alert(data.success ? 'Sale cancelled!' : 'Error cancelling sale.').then(() => {
      if (data.success) {
        Auth.refreshAccount();
        Market.refresh();
      }
    });
  },

  viewSecret(itemId) {
    const item = state.items.find(i => i.id === itemId);
    Modal.alert(`Secret (do not share): ${item.item_secret}`);
  },

  async recycle(itemId) {
    if (!await Modal.confirm('Are you sure you want to recycle this item?')) return;

    const data = await API.post('/api/recycle_item', { item_id: itemId });
    await Modal.alert(data.success ? 'Recycled item!' : 'Failed to recycle item.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  }
};

// Market Management
const Market = {
  filter(items) {
    const { searchQuery, rarity, priceMin, priceMax, seller } = state.marketFilters;
    return items.filter(item => {
      const fullName = `${item.name.adjective} ${item.name.material} ${item.name.noun} ${item.name.suffix} #${item.name.number}`.toLowerCase();
      const min = priceMin ? Number(priceMin) : -Infinity;
      const max = priceMax ? Number(priceMax) : Infinity;
      return fullName.includes(searchQuery) &&
        (!rarity || item.level === rarity) &&
        item.price >= min && item.price <= max &&
        (!seller || item.owner.toLowerCase().includes(seller));
    });
  },

  applyFilters() {
    const oldFilters = { ...state.marketFilters };
    state.marketFilters.searchQuery = document.getElementById('marketSearch').value.toLowerCase();
    state.marketFilters.rarity = document.getElementById('marketRarityFilter').value;
    state.marketFilters.priceMin = document.getElementById('marketPriceMin').value;
    state.marketFilters.priceMax = document.getElementById('marketPriceMax').value;
    state.marketFilters.seller = document.getElementById('marketSellerFilter').value.toLowerCase();

    if (JSON.stringify(oldFilters) !== JSON.stringify(state.marketFilters)) state.marketPage = 1;
    this.render(this.filter(state.marketItems));
  },

  async refresh() {
    let rawData = await API.get('/api/market');

    if (!rawData.success) {
      console.error('Failed fetch inventory: ' + rawData.error);
      state.marketItems = [];
      return this.applyFilters();
    }

    state.marketItems = Object.values(rawData).filter(item => typeof item === 'object');
    this.applyFilters();
  },

  render(filteredItems) {
    const marketList = document.getElementById('marketList');
    marketList.innerHTML = '';
    const start = (state.marketPage - 1) * ITEMS_PER_PAGE;
    const pagedItems = filteredItems.slice(start, start + ITEMS_PER_PAGE);

    pagedItems.forEach(item => {
      const li = document.createElement('li');
      li.className = 'market-item';
      li.innerHTML = `
                <div class="item-header">
                    <span class="item-icon">${item.name.icon}</span>
                    <span class="item-name">${item.name.adjective} ${item.name.material} ${item.name.noun} ${item.name.suffix} #${item.name.number}</span>
                </div>
                <div class="item-details">
                    <span class="item-level">⚔️ ${item.rarity} ${item.level}</span>
                    <span class="item-price">💰 ${item.price} tokens</span>
                    <span class="item-seller">👤 ${item.owner}</span>
                </div>
            `;

      if (item.owner !== state.account.username) {
        const actions = document.createElement('div');
        actions.className = 'market-actions';
        actions.appendChild(Inventory.createButton('🛒 Purchase', 'btn-buy', () => this.buy(item.id)));
        li.appendChild(actions);
      }

      marketList.appendChild(li);
    });

    this.renderPagination(filteredItems);
  },

  renderPagination(filteredItems) {
    const container = document.getElementById('marketplacePagination');
    container.innerHTML = '';
    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

    container.appendChild(Inventory.createPaginationButton('◀ Previous', state.marketPage === 1, () => state.marketPage > 1 && (state.marketPage--, this.render(filteredItems))));
    const pageInfo = document.createElement('span');
    pageInfo.className = 'pagination-info';
    pageInfo.innerHTML = `Page <strong>${state.marketPage}</strong> of <strong>${totalPages}</strong> (Showing ${filteredItems.length} listings)`;
    container.appendChild(pageInfo);
    container.appendChild(Inventory.createPaginationButton('Next ▶', state.marketPage >= totalPages, () => state.marketPage < totalPages && (state.marketPage++, this.render(filteredItems))));
  },

  async buy(itemId) {
    if (!await Modal.confirm('Are you sure you want to purchase this item?')) return;

    const data = await API.post('/api/buy_item', { item_id: itemId });
    if (data.success) await Modal.alert('Item purchased!').then(() => {
      Auth.refreshAccount();
      this.refresh();
    });
  }
};

// Casino
const Casino = {
  async bet(choice) {
    const betAmount = parseFloat(document.getElementById('betAmount').value);
    if (!betAmount || betAmount <= 0) {
      await Modal.alert('Please enter a valid bet amount.');
      return;
    }

    const data = await API.post('/api/coin_flip', { bet_amount: betAmount, choice });
    if (!data.success) {
      await Modal.alert(`Error placing bet: ${data.error}`);
      return;
    }

    this.animateCoinFlip(data.result, data.won, betAmount, data.winnings);
    Auth.refreshAccount();
  },

  animateCoinFlip(result, won, betAmount, winnings) {
    const resultEl = document.getElementById('casinoResult');
    resultEl.textContent = 'Flipping coin...';
    resultEl.classList.add('flipping');

    setTimeout(() => {
      resultEl.classList.remove('flipping');
      resultEl.textContent = `Result: ${result.toUpperCase()}! You ${won ? 'won' : 'lost'}! ${won ? `Winnings: ${winnings} tokens` : `Lost: ${betAmount} tokens`}`;
      resultEl.classList.add(won ? 'won' : 'lost');
      if (won) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      setTimeout(() => resultEl.classList.remove(won ? 'won' : 'lost'), 3000);
    }, CASINO_ANIMATION_DURATION);
  },

  async rollDice() {
    const betAmount = parseFloat(document.getElementById('diceBetAmount').value);
    const selectedNumber = document.querySelector('input[name="dice-number"]:checked');

    // Validate input
    if (!selectedNumber) {
      await Modal.alert('Please select a number to bet on.');
      return;
    }
    const choice = parseInt(selectedNumber.value);
    if (!betAmount || betAmount <= 0) {
      await Modal.alert('Please enter a valid bet amount.');
      return;
    }

    // Send bet to backend
    const data = await API.post('/api/dice_roll', { bet_amount: betAmount, choice });
    if (!data.success) {
      await Modal.alert(`Error placing bet: ${data.error}`);
      return;
    }

    // Animate and display result
    this.animateDiceRoll(data.result, data.won, betAmount, data.winnings);
    Auth.refreshAccount(); // Update user's token display
  },

  animateDiceRoll(result, won, betAmount, winnings) {
    const resultEl = document.getElementById('diceResult');
    resultEl.textContent = 'Rolling dice...';

    setTimeout(() => {
      resultEl.textContent = `Result: ${result}! You ${won ? 'won' : 'lost'}! ${won ? `Winnings: ${winnings} tokens` : `Lost: ${betAmount} tokens`}`;
      if (won) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }, CASINO_ANIMATION_DURATION);
  }
};

// Pet Management
const Pets = {
  async render() {
    if (JSON.stringify(state.pets) === JSON.stringify(state.oldPets)) return;

    const container = document.getElementById('petContainer');
    container.innerHTML = '';

    state.pets.forEach(pet => {
      const petCard = document.createElement('div');
      petCard.className = `pet-card ${pet.status} fade-in`;
      petCard.setAttribute('data-pet-id', pet.id);
      petCard.innerHTML = `
        <div class="pet-header">
          <span class="pet-name">${pet.name} ${pet.alive ? '' : '(Dead)'}</span>
          <span class="pet-type">${this.getTypeIcon(pet.name)}</span>
        </div>
        <div class="pet-status">
          <div class="status-bar hunger">
            <div class="status-fill" style="width: ${pet.hunger}%"></div>
            <span class="status-text">🍖 ${this.getHungerText(pet.hunger)}</span>
          </div>
          <div class="status-bar happiness">
            <div class="status-fill" style="width: ${pet.happiness}%"></div>
            <span class="status-text">❤️ ${this.getHappinessText(pet.happiness)}</span>
          </div>
        </div>
        <div class="pet-actions">
          <button class="btn btn-feed" onclick="Pets.feed('${pet.id}')">
            🍖 Feed (10 tokens)
          </button>
          <button class="btn btn-play" onclick="Pets.play('${pet.id}')">
            🎾 Play (Free)
          </button>
        </div>
        <div class="pet-level">
          Level ${pet.level} • ${pet.exp}/${expForLevel(pet.level + 1)} until next level
        </div>
        <div class="pet-benefits">
          +${pet.benefits.token_bonus} tokens per mine <br>
        </div>
      `;
      container.appendChild(petCard);
    });

    if (!state.pets.length) {
      container.innerHTML = `
        <div class="no-pets">
          <p>No pets yet! Adopt one below 🐾</p>
        </div>
      `;
    }
  },

  async buy() {
    if (!await Modal.confirm(`Adopt a pet for 100 tokens?`)) return;

    const data = await API.post('/api/buy_pet');
    if (data.success) {
      this.showAnimation('✨', 'New pet added!');
      Auth.refreshAccount();
    } else {
      Modal.alert(`Failed to adopt: ${data.error}`);
    }
  },

  async feed(petId) {
    const data = await API.post('/api/feed_pet', { pet_id: petId });
    if (data.success) {
      this.showAnimation('❤️', '+10 Happiness & +10 Hunger', petId);
      this.render();
      Auth.refreshAccount();
    }
  },

  async play(petId) {
    const data = await API.post('/api/play_with_pet', { pet_id: petId });
    if (data.success) {
      this.showAnimation('⚡', '+5 XP & +5 Happiness', petId);
      this.render();
    }
  },

  // Helper functions
  getTypeIcon(type) {
    return {
      Dragon: '🐉',
      Pheonix: '🦅',
      Raven: '🦅',
      Eagle: '🦅',
      Cheetah: '🐆',
      Lion: '🦁',
      Panther: '🐆',
      Tiger: '🐅',
      Wolf: '🐺',
      Bear: '🐻',
      Fox: '🦊',
      Cat: '🐱',
      Dog: '🐶',
      Hound: '🐕',
      Hawk: '🦅',
    }[type] || '❓';
  },

  getHungerText(percent) {
    if (percent > 75) return 'Stuffed!';
    if (percent > 50) return 'Content';
    if (percent > 25) return 'Peckish';
    return 'Hungry!';
  },

  getHappinessText(percent) {
    if (percent > 75) return 'Ecstatic!';
    if (percent > 50) return 'Happy';
    if (percent > 25) return 'Bored';
    return 'Depressed!';
  },

  showAnimation(emoji, text, petId) {
    const animDiv = document.createElement('div');
    animDiv.className = 'pet-animation';
    animDiv.innerHTML = `
      <span class="emoji">${emoji}</span>
      <span class="text">${text}</span>
    `;

    if (petId) {
      const petCard = document.querySelector(`[data-pet-id="${petId}"]`);
      petCard.appendChild(animDiv);
    } else {
      document.body.appendChild(animDiv);
    }

    setTimeout(() => animDiv.remove(), 2000);
  },

  async showHelp() {
    const helpText = `
      <h3>Pet Care Guide</h3>
      <p>Pets require food and playtime to stay happy and healthy.</p>
      <p>Feed your pet to increase its hunger and happiness.</p>
      <p>Play with your pet to increase its happiness and experience points.</p>
      <p>Leveling up your pet increases its stats and unlocks new abilities!</p>
    `;
    await Modal.alert(helpText);
  }
};

const Company = {
  async refresh() {
    const data = await API.get('/api/get_company');
    this.render(data.company);
  },

  render(company) {
    const createForm = document.getElementById('createCompanyForm');
    const dashboard = document.getElementById('companyDashboard');

    if (!company) {
      createForm.style.display = 'block';
      dashboard.style.display = 'none';
    } else {
      createForm.style.display = 'none';
      dashboard.style.display = 'block';

      document.getElementById('companyName').textContent = company.name;
      document.getElementById('companyType').textContent = company.type;
      document.getElementById('workerCount').textContent = company.workers;

      const taskList = document.getElementById('taskList');
      taskList.innerHTML = '';
      company.tasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.textContent = `${task.name} - ${task.status}`;
        if (task.status === 'in_progress') {
          const completeButton = document.createElement('button');
          completeButton.textContent = 'Complete';
          completeButton.onclick = () => this.startMinigameForTask(company.id, task.id);
          taskItem.appendChild(completeButton);
        }
        taskList.appendChild(taskItem);
      });
    }
  },

  async create() {
    const name = document.getElementById('companyNameInput').value;
    const type = document.getElementById('companyTypeSelect').value;
    const data = await API.post('/api/create_company', { name, type });
    if (data.success) {
      await Modal.alert('Company created!');
      this.refresh();
    } else {
      await Modal.alert(`Error: ${data.error}`);
    }
  },

  async hireWorker(companyId) {
    const data = await API.post('/api/hire_worker', { company_id: companyId });
    if (data.success) {
      await Modal.alert('Worker hired!');
      this.refresh();
    } else {
      await Modal.alert(`Error: ${data.error}`);
    }
  },

  async assignTask(companyId) {
    const taskName = document.getElementById('taskNameInput').value;
    const data = await API.post('/api/assign_task', { company_id: companyId, task_name: taskName });
    if (data.success) {
      await Modal.alert('Task assigned!');
      this.refresh();
    } else {
      await Modal.alert(`Error: ${data.error}`);
    }
  },

  async startMinigameForTask(companyId, taskId) {
    const modal = document.getElementById('minigameModal');
    modal.classList.add('active');
    resetGame();

    document.getElementById('finishGameButton').onclick = async () => {
      clearInterval(gameInterval);
      const data = await API.post('/api/complete_task', { company_id: companyId, task_id: taskId, score: gameScore });
      modal.classList.remove('active');
      if (data.success) {
        await Modal.alert('Task completed successfully!');
        this.refresh();
      } else {
        await Modal.alert(`Error completing task: ${data.error}`);
      }
    };
  },
};

// Chat Management
const Chat = {
  async send() {
    const message = document.getElementById('messageInput').value.trim();
    if (!message) return;

    document.getElementById('messageInput').value = '';

    const data = await API.post('/api/send_message', { message });
    if (data.success) {
      this.refresh();
    } else {
      Sounds.error.play();
      await Modal.alert(`Error sending message: ${data.error}`);
    }
  },

  async refresh() {
    const data = await API.get('/api/get_messages?room=global');
    if (!data.messages || data.messages.length === state.globalMessages.length) return;

    const container = document.getElementById('globalMessages');
    container.innerHTML = '';
    data.messages.forEach(msg => this.append(msg));
    state.globalMessages = data.messages;
  },

  append(message) {
    const container = document.getElementById('globalMessages');
    const isOwn = message.username === state.account.username;
    const type = message.type || 'user';

    if (!state.isChatFocused) {
      state.unreadMessages++;
      Sounds.notification.play();
      document.querySelector('[data-tab="chat"]').classList.add('new-messages');
    }

    if (message.type === 'system') {
      messagePrefix = '⚙️';
    } else if (message.type === 'admin') {
      messagePrefix = '🛠️';
    } else if (message.type === 'mod') {
      messagePrefix = '🛡️';
    } else if (message.type === 'media') {
      messagePrefix = '🎥';
    } else if (message.type === 'msg') {
      messagePrefix = '💬';
    } else {
      messagePrefix = '';
    }

    const messageEl = document.createElement('div');
    messageEl.className = `message ${type} ${isOwn ? 'own-message' : ''}`;
    messageEl.innerHTML = `
            <div class="message-header">
                <span class="message-sender ${type}" title="${type.charAt(0).toUpperCase() + type.slice(1)}">
                    ${messagePrefix} ${message.username}
                </span>
                <span class="message-time">${UI.formatTime(message.timestamp)}</span>
            </div>
            <div class="message-content">${message.message}</div>
            ${(state.account.type === 'admin' || state.account.type === 'mod') ? `<button class="delete-message" onclick="Chat.delete('${message.id}')">🗑️</button>` : ''}
        `;
    container.appendChild(messageEl);
  },

  async delete(messageId) {
    const data = await API.post('/api/delete_message', { message_id: messageId });
    if (data.success) this.refresh();
    else await Modal.alert('Error deleting message.');
  }
};

// Admin/Mod Functions
const Admin = {
  async resetCooldown() {
    const data = await API.post('/api/reset_cooldowns');
    await Modal.alert(data.success ? 'Cooldown reset!' : 'Error resetting cooldown.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async editTokens(username = null) {
    const tokens = await Modal.prompt('Enter tokens:');
    if (!tokens) return;
    const data = await API.post('/api/edit_tokens', username ? { username, tokens: parseFloat(tokens) } : { tokens: parseFloat(tokens) });
    await Modal.alert(data.success ? 'Tokens edited!' : 'Error editing tokens.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async editExp(username = null) {
    const exp = await Modal.prompt('Enter exp:');
    if (!exp) return;
    const data = await API.post('/api/edit_exp', username ? { username, exp: parseFloat(exp) } : { exp: parseFloat(exp) });
    await Modal.alert(data.success ? 'Exp edited!' : 'Error editing exp.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async editLevel(username = null) {
    const level = await Modal.prompt('Enter level:');
    if (!level) return;
    const data = await API.post('/api/edit_level', username ? { username, level: parseFloat(level) } : { level: parseFloat(level) });
    await Modal.alert(data.success ? 'Level edited!' : 'Error editing level.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async editItem(itemId) {
    const newName = await Modal.prompt('Enter new name (blank for no change):');
    const newIcon = await Modal.prompt('Enter new icon (blank for no change):');
    const newRarity = await Modal.prompt('Enter new rarity (blank for no change):');
    const data = await API.post('/api/edit_item', { item_id: itemId, new_name: newName, new_icon: newIcon, new_rarity: newRarity });
    await Modal.alert(data.success ? 'Item edited!' : 'Error editing item.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async deleteItem(itemId) {
    if (!await Modal.confirm('Are you sure you want to delete this item?')) return;
    const data = await API.post('/api/delete_item', { item_id: itemId });
    await Modal.alert(data.success ? 'Item deleted!' : 'Error deleting item.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async addAdmin() {
    const username = await Modal.prompt('Enter username:');
    if (!username) return;
    const data = await API.post('/api/add_admin', { username });
    await Modal.alert(data.success ? 'Admin added!' : 'Error adding admin.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async removeAdmin() {
    const username = await Modal.prompt('Enter username:');
    if (!username) return;
    const data = await API.post('/api/remove_admin', { username });
    await Modal.alert(data.success ? 'Admin removed!' : 'Error removing admin.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async addMod() {
    const username = await Modal.prompt('Enter username:');
    if (!username) return;
    const data = await API.post('/api/add_mod', { username });
    await Modal.alert(data.success ? 'Mod added!' : 'Error adding mod.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async removeMod() {
    const username = await Modal.prompt('Enter username:');
    if (!username) return;
    const data = await API.post('/api/remove_mod', { username });
    await Modal.alert(data.success ? 'Mod removed!' : 'Error removing mod.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async addMedia() {
    const username = await Modal.prompt('Enter username:');
    if (!username) return;
    const data = await API.post('/api/add_media', { username });
    await Modal.alert(data.success ? 'Media added!' : 'Error adding media.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async removeMedia() {
    const username = await Modal.prompt('Enter username:');
    if (!username) return;
    const data = await API.post('/api/remove_media', { username });
    await Modal.alert(data.success ? 'Media removed!' : 'Error removing media.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async banUser() {
    const username = await Modal.prompt('Enter username to ban:');
    if (!username) return;
    const reason = await Modal.prompt('Enter reason for banning:');
    if (!reason) return;
    const length = await Modal.prompt('Enter ban length (e.g., 1h, 1d, perma):');
    if (!length) return;
    const data = await API.post('/api/ban_user', { username, reason, length });
    await Modal.alert(data.success ? 'User banned!' : 'Error banning user.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async unbanUser() {
    const username = await Modal.prompt('Enter username to unban:');
    if (!username) return;
    const data = await API.post('/api/unban_user', { username });
    await Modal.alert(data.success ? 'User unbanned!' : 'Error unbanning user.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async muteUser() {
    const username = await Modal.prompt('Enter username to mute:');
    if (!username) return;
    const length = await Modal.prompt('Enter mute length (e.g., 1h, 1d, perma):');
    if (!length) return;
    const data = await API.post('/api/mute_user', { username, length });
    await Modal.alert(data.success ? 'User muted!' : 'Error muting user.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async unmuteUser() {
    const username = await Modal.prompt('Enter username to unmute:');
    if (!username) return;
    const data = await API.post('/api/unmute_user', { username });
    await Modal.alert(data.success ? 'User unmuted!' : 'Error unmuting user.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async fineUser() {
    const username = await Modal.prompt('Enter username to fine:');
    if (!username) return;
    const amount = await Modal.prompt('Enter fine amount:');
    if (!amount) return;
    const data = await API.post('/api/fine_user', { username, amount: parseFloat(amount) });
    await Modal.alert(data.success ? 'User fined!' : 'Error fining user.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async setBanner() {
    const banner = await Modal.prompt('Enter banner:');
    if (!banner) return;
    const data = await API.post('/api/set_banner', { banner });
    await Modal.alert(data.success ? 'Banner set!' : 'Error setting banner.').then(() => {
      if (data.success) this.refreshBanner();
    });
  },

  async listUsers() {
    const data = await API.get('/api/users');
    if (data.usernames) {
      const container = document.createElement('div');
      data.usernames.forEach(username => {
        const p = document.createElement('p');
        p.innerText = username;
        container.appendChild(p);
      });
      await Modal.alert(container.innerHTML);
    }
  },

  async refreshBanner() {
    const data = await API.get('/api/get_banner');
    if (data.banner) {
      const bannerEl = document.getElementById('banner');
      bannerEl.style.display = 'block';
      bannerEl.innerHTML = data.banner.value;
    }
  },

  async refreshLeaderboard() {
    const data = await API.get('/api/leaderboard');
    if (data.leaderboard) {
      const leaderboard = document.getElementById('leaderboard');
      leaderboard.innerHTML = '';
      data.leaderboard.forEach(user => {
        const div = document.createElement('div');
        if (user.username === state.account.username) div.classList.add('highlight');
        div.innerHTML = `
  ${user.place <= 3 ? ['🥇', '🥈', '🥉'][user.place - 1] : '🏅'} 
  ${user.place}: ${user.username} 
  <span class="tokens-badge">${user.tokens} tokens</span>
`;
        leaderboard.appendChild(div);
      });
    }
  },

  async refreshStats() {
    const data = await API.get('/api/stats');

    function animateCounter(element, final) {
      let current = parseInt(element.textContent) || 0;
      const duration = 2000;
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        element.textContent = Math.floor(progress * (final - current) + current);
        if (progress < 1) requestAnimationFrame(step);
      };
      let start;
      requestAnimationFrame(step);
    }

    if (data.stats) {
      const totalTokens = document.getElementById('totalTokens');
      const totalAccounts = document.getElementById('totalAccounts');
      const totalItems = document.getElementById('totalItems');

      animateCounter(totalTokens, data.stats.total_tokens);
      animateCounter(totalAccounts, data.stats.total_accounts);
      animateCounter(totalItems, data.stats.total_items);
    }
  },

  async getBannedUsers() {
    const data = await API.get('/api/get_banned');
    if (data.banned_users) {
      const container = document.createElement('div');
      data.banned_users.forEach(username => {
        const p = document.createElement('p');
        p.innerText = username;
        container.appendChild(p);
      });
      await Modal.alert(container.innerHTML);
    }
  },

  async deleteUser() {
    const username = await Modal.prompt('Enter username to delete:');
    if (!username) return;
    const data = await API.post('/api/delete_user', { username });
    await Modal.alert(data.success ? 'User deleted!' : 'Error deleting user.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async createCreatorCode() {
    const code = await Modal.prompt('Enter code:');
    if (!code) return;
    const extraTokens = parseInt(await Modal.prompt('Enter extra tokens:')) || 0;
    if (!extraTokens) return;
    const extraPets = parseInt(await Modal.prompt('Enter extra pets:')) || 0;
    if (!extraPets) return;

    const data = await API.post('/api/create_creator_code', { code, tokens: extraTokens, pets: extraPets });

    await Modal.alert(data.success ? 'Creator code created!' : 'Error creating creator code.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async deleteCreatorCode() {
    const code = await Modal.prompt('Enter code:');
    if (!code) return;
    if (!await Modal.confirm(`Are you sure you want to delete the creator code: ${code}?`)) return;
    const data = await API.post('/api/delete_creator_code', { code });
    await Modal.alert(data.success ? 'Creator code deleted!' : 'Error deleting creator code.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async getCreatorCodes() {
    const data = await API.get('/api/get_creator_codes');
    if (data.creator_codes) {
      const container = document.createElement('div');
      data.creator_codes.forEach(code => {
        const p = document.createElement('p');
        p.innerText = `${code.code} (${code.tokens} tokens, ${code.pets} pets)`;
        container.appendChild(p);
      });
      await Modal.alert(container.innerHTML);
    }
  },

  async setCompanyTokens() {
    const company = await Modal.prompt('Enter company name:');
    if (!company) return;
    const tokens = await Modal.prompt('Enter tokens:');
    if (!tokens) return;
    const data = await API.post('/api/set_company_tokens', { company, tokens });
    await Modal.alert(data.success ? 'Company edited!' : 'Error editing company.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async restorePet() {
    const petId = await Modal.prompt('Enter pet ID:');
    if (!petId) return;
    const data = await API.post('/api/restore_pet', { pet_id: petId });
    await Modal.alert(data.success ? 'Pet restored!' : 'Error restoring pet.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  },

  async deleteCompany() {
    const company = await Modal.prompt('Enter company ID:');
    if (!company) return;
    if (!await Modal.confirm(`Are you sure you want to delete the company?`)) return;
    const data = await API.post('/api/delete_company', { company_id: company });
    await Modal.alert(data.success ? 'Company deleted!' : 'Error deleting company.').then(() => {
      if (data.success) Auth.refreshAccount();
    });
  }
};

const ServerStatus = {
  async checkServerOnline() {
    try {
      const response = await fetch(`${API_BASE}/api/ping`);
      return response.ok;
    } catch (error) {
      console.error('Error checking server status:', error);
      return false;
    }
  }
};

// Sound Effects
const Sounds = {
  itemCreate: new Audio('sounds/item-create.mp3'),
  error: new Audio('sounds/error.mp3'),
  success: new Audio('sounds/success.mp3'),
  notification: new Audio('sounds/notification.mp3'),
};

const TypingIndicator = {
  typingUsers: new Set(),

  startTyping(username) {
    this.typingUsers.add(username);
    this.updateIndicator();
  },

  stopTyping(username) {
    this.typingUsers.delete(username);
    this.updateIndicator();
  },

  updateIndicator() {
    const indicator = document.getElementById('typingIndicator');
    const typingArray = Array.from(this.typingUsers);
    const maxDisplay = 3;

    if (this.typingUsers.size > 0) {
      const displayedUsers = typingArray.slice(0, maxDisplay).join(', ');
      const othersCount = this.typingUsers.size - maxDisplay;
      indicator.textContent = othersCount > 0
        ? `${displayedUsers}, and ${othersCount} others are typing...`
        : `${displayedUsers} ${this.typingUsers.size > 1 ? 'are' : 'is'} typing...`;
      indicator.style.display = 'block';
    } else {
      indicator.style.display = 'none';
    }
  },
};

// Event Listeners
const initEventListeners = () => {
  // Tabs
  document.querySelectorAll('.tab').forEach(btn =>
    btn.addEventListener('click', () => UI.switchTab(btn.dataset.tab))
  );

  // Chat Typing
  const messageInput = document.getElementById('messageInput');
  let typingTimeout;

  messageInput.addEventListener('input', () => {
    clearTimeout(typingTimeout);
    API.post('/api/start_typing', { room: 'global' });
    typingTimeout = setTimeout(() => {
      API.post('/api/stop_typing', { room: 'global' });
    }, 3000);
  });

  // Inventory Actions
  document.getElementById('createItem').addEventListener('click', Inventory.create);
  document.getElementById('mineItem').addEventListener('click', async () => {
    const data = await API.post('/api/mine_tokens');
    if (data.error) {
      Sounds.error.play();
      return Modal.alert(`Error mining tokens: ${data.error}`);
    } else {
      Sounds.success.play();
      await Modal.alert(`Mined ${data.tokens} tokens!`).then(Auth.refreshAccount);
    }
  });
  document.getElementById('takeItem').addEventListener('click', async () => {
    const secret = await Modal.prompt('Enter secret:');
    if (!secret) return;
    const data = await API.post('/api/take_item', { item_secret: secret });
    await Modal.alert(data.success ? 'Item taken!' : 'Error taking item.').then(() => {
      if (data.success) {
        Auth.refreshAccount();
        Market.refresh();
      }
    });
  });

  // User Actions
  document.getElementById('sendTokens').addEventListener('click', Auth.sendTokens);
  document.getElementById('sendMessage').addEventListener('click', Chat.send);
  document.getElementById('messageInput').addEventListener('keyup', e => {
    if (e.key === 'Enter') Chat.send();
  });
  document.getElementById('themeSelect').addEventListener('change', e => UI.setTheme(e.target.value));
  document.getElementById('redeemCreatorCode').addEventListener('click', Auth.redeemCreatorCode);
  document.getElementById('deleteAccount').addEventListener('click', Auth.deleteAccount);
  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    location.reload();
  });

  // Two-Factor Authentication (2FA)
  document.getElementById('setup2FA').addEventListener('click', Auth.setup2FA);
  document.getElementById('disable2FA').addEventListener('click', Auth.disable2FA);
  document.getElementById('2faSetupSubmit').addEventListener('click', Auth.enable2FA);
  document.getElementById('2faSetupCancel').addEventListener('click', () => location.reload());

  // Admin Dashboard
  const adminActions = {
    listUsersAdmin: Admin.listUsers,
    getBannedUsersAdmin: Admin.getBannedUsers,
    createCreatorCodeAdmin: Admin.createCreatorCode,
    deleteCreatorCodeAdmin: Admin.deleteCreatorCode,
    getCreatorCodesAdmin: Admin.getCreatorCodes,
    setBannerAdmin: Admin.setBanner,
    editTokensAdmin: Admin.editTokens,
    editCompanyTokensAdmin: Admin.setCompanyTokens,
    editExpAdmin: Admin.editExp,
    editLevelAdmin: Admin.editLevel,
    addAdminAdmin: Admin.addAdmin,
    removeAdminAdmin: Admin.removeAdmin,
    addModAdmin: Admin.addMod,
    removeModAdmin: Admin.removeMod,
    addMediaAdmin: Admin.addMedia,
    removeMediaAdmin: Admin.removeMedia,
    banUserAdmin: Admin.banUser,
    unbanUserAdmin: Admin.unbanUser,
    muteUserAdmin: Admin.muteUser,
    unmuteUserAdmin: Admin.unmuteUser,
    fineUserAdmin: Admin.fineUser,
    deleteUserAdmin: Admin.deleteUser,
    restorePetAdmin: Admin.restorePet,
    deleteCompanyAdmin: Admin.deleteCompany,
  };
  Object.keys(adminActions).forEach(id =>
    document.getElementById(id).addEventListener('click', adminActions[id])
  );

  // User-Specific Admin Edits
  const promptActions = {
    editExpForUserAdmin: Admin.editExp,
    editLevelForUserAdmin: Admin.editLevel,
    editTokensForUserAdmin: Admin.editTokens
  };
  Object.keys(promptActions).forEach(id => {
    document.getElementById(id).addEventListener('click', async () => {
      const username = await Modal.prompt('Enter username:');
      if (username) promptActions[id](username);
    });
  });

  // Mod Dashboard
  document.getElementById('listUsersMod').addEventListener('click', Admin.listUsers);
  document.getElementById('muteUserMod').addEventListener('click', Admin.muteUser);
  document.getElementById('unmuteUserMod').addEventListener('click', Admin.unmuteUser);

  // Casino
  document.getElementById('betHeads').addEventListener('click', () => Casino.bet('heads'));
  document.getElementById('betTails').addEventListener('click', () => Casino.bet('tails'));
  document.getElementById('rollDice').addEventListener('click', Casino.rollDice);

  const emojiPicker = document.getElementById('emojiPicker');
  EMOJIS.forEach(emoji => {
    const span = document.createElement('span');
    span.textContent = emoji;
    span.onclick = () => {
      document.getElementById('messageInput').value += emoji;
      document.getElementById('messageInput').focus();
    };
    emojiPicker.appendChild(span);
  });

  document.getElementById('emojiToggle').addEventListener('click', function (e) {
    e.preventDefault();
    emojiPicker.classList.toggle('show');
  });

  // Event Listeners for Company Management
  document.getElementById('createCompany').onsubmit = async (e) => {
    e.preventDefault();
    await Company.create();
  };

  document.getElementById('hireWorkerButton').onclick = async () => {
    const company = await API.get('/api/get_company');
    await Company.hireWorker(company.company.id);
  };

  document.getElementById('assignTaskForm').onsubmit = async (e) => {
    e.preventDefault();
    const company = await API.get('/api/get_company');
    await Company.assignTask(company.company.id);
  };

  // Initialize Company Tab
  UI.showCompanyManagement = () => {
    Company.refresh();
  };
};


// Initialization
const init = async () => {
  UI.initializeTheme();

  // if (!await ServerStatus.checkServerOnline()) {
  //   window.location.href = 'unavailable.html';
  // }

  Admin.refreshStats();

  setInterval(() => {
    if (!state.token || document.getElementById('homepage').style.display === 'block') return;
    Admin.refreshStats();
    Admin.refreshBanner();
    Auth.refreshAccount();
    Chat.refresh();
    Admin.refreshLeaderboard();
    Market.refresh();
    Company.refresh();
  }, 1000);

  initEventListeners();
};

init();

document.addEventListener("DOMContentLoaded", () => {
  // Animate main content fade-in
  anime({
    targets: "#mainContent",
    opacity: [0, 1],
    duration: 1000,
    easing: "easeInOutQuad",
    begin: () => {
      document.getElementById("mainContent").style.display = "block";
    },
  });

  // Button click animation
  document.querySelectorAll(".animated-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      anime({
        targets: btn,
        scale: [1, 1.2, 1],
        duration: 300,
        easing: "easeInOutQuad",
      });
    });
  });

  // Animate new list items
  const taskList = document.getElementById("taskList");
  document.getElementById("assignTaskForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const taskName = document.getElementById("taskNameInput").value;
    const newTask = document.createElement("li");
    newTask.textContent = taskName;
    taskList.appendChild(newTask);

    anime({
      targets: newTask,
      opacity: [0, 1],
      translateY: [-10, 0],
      duration: 500,
      easing: "easeOutQuad",
    });

    document.getElementById("taskNameInput").value = "";
  });
});

let gameInterval;
let gameScore = 0;
let gameTimeLeft = 30;

function startMinigame() {
  const modal = document.getElementById("minigameModal");
  modal.classList.add("active");
  resetGame();
}

function resetGame() {
  gameScore = 0;
  gameTimeLeft = 30;
  document.getElementById("scoreDisplay").textContent = `Score: ${gameScore}`;
  document.getElementById("startGameButton").style.display = "block";
  document.getElementById("finishGameButton").style.display = "none";
  document.getElementById("gameArea").innerHTML = "";
  clearInterval(gameInterval);
}

function startGame() {
  const selectedGame = document.getElementById("gameSelector").value;
  document.getElementById("startGameButton").style.display = "none";
  document.getElementById("finishGameButton").style.display = "block";

  switch (selectedGame) {
    case "clickTheTarget":
      startClickTheTarget();
      break;
    case "mathQuiz":
      startMathQuiz();
      break;
    case "memoryGame":
      startMemoryGame();
      break;
    case "reactionTime":
      startReactionTime();
      break;
    case "wordScramble":
      startWordScramble();
      break;
  }
}

function completeMinigame(score) {
  const modal = document.getElementById("minigameModal");
  modal.classList.remove("active");

  if (score < 10) {
    Modal.alert("You need at least 10 points to complete the task.");
    return;
  }

  Modal.alert(`Task completed! You earned ${score * 10} tokens.`);
  API.post("/api/complete_task", { minigame_result: true }).then(() => Auth.refreshAccount());
}

// Minigame 1: Click the Target
function startClickTheTarget() {
  const gameArea = document.getElementById("gameArea");
  const target = document.createElement("div");
  target.className = "target";
  gameArea.appendChild(target);

  target.onclick = () => {
    gameScore++;
    document.getElementById("scoreDisplay").textContent = `Score: ${gameScore}`;
    moveTargetRandomly(target, gameArea);
  };

  moveTargetRandomly(target, gameArea);
  startGameTimer();
}

function moveTargetRandomly(target, gameArea) {
  const maxX = gameArea.offsetWidth - target.offsetWidth;
  const maxY = gameArea.offsetHeight - target.offsetHeight;
  target.style.left = `${Math.random() * maxX}px`;
  target.style.top = `${Math.random() * maxY}px`;
}

// Minigame 2: Math Quiz
function startMathQuiz() {
  const gameArea = document.getElementById("gameArea");
  const question = document.createElement("p");
  const input = document.createElement("input");
  const submit = document.createElement("button");

  input.type = "number";
  submit.textContent = "Submit";

  gameArea.appendChild(question);
  gameArea.appendChild(input);
  gameArea.appendChild(submit);

  generateMathQuestion(question, input, submit);
  startGameTimer();
}

function generateMathQuestion(question, input, submit) {
  const questionTypes = [
    {
      generate: () => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        return {
          text: `What is ${num1} + ${num2}?`,
          answer: num1 + num2,
        };
      },
    },
    {
      generate: () => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        return {
          text: `What is ${num1} - ${num2}?`,
          answer: num1 - num2,
        };
      },
    },
    {
      generate: () => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        return {
          text: `What is ${num1} × ${num2}?`,
          answer: num1 * num2,
        };
      },
    },
    {
      generate: () => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        return {
          text: `What is ${num1 * num2} ÷ ${num1}?`,
          answer: num2,
        };
      },
    },
  ];

  function generateQuestion() {
    const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    return randomType.generate();
  }

  function askQuestion() {
    const { text, answer } = generateQuestion();
    question.textContent = text;
    input.value = "";

    submit.onclick = () => {
      if (parseInt(input.value) === answer) {
        gameScore++;
        document.getElementById("scoreDisplay").textContent = `Score: ${gameScore}`;
        askQuestion();
      }
    };
  }

  askQuestion();
}

// Minigame 3: Memory Game
function startMemoryGame() {
  const gameArea = document.getElementById("gameArea");
  const sequence = [];
  let userSequence = [];
  let level = 1;

  function generateSequence() {
    sequence.push(Math.floor(Math.random() * 4));
    displaySequence();
  }

  function displaySequence() {
    gameArea.innerHTML = "";
    sequence.forEach((num, index) => {
      setTimeout(() => {
        const box = document.createElement("div");
        box.className = `memory-box box-${num}`;
        gameArea.appendChild(box);
        setTimeout(() => (box.style.backgroundColor = ""), 500);
      }, index * 1000);
    });

    setTimeout(() => {
      gameArea.innerHTML = "";
      createMemoryBoxes();
    }, sequence.length * 1000);
  }

  function createMemoryBoxes() {
    for (let i = 0; i < 4; i++) {
      const box = document.createElement("div");
      box.className = `memory-box box-${i}`;
      box.onclick = () => {
        userSequence.push(i);
        if (userSequence.length === sequence.length) {
          if (JSON.stringify(userSequence) === JSON.stringify(sequence)) {
            gameScore++;
            document.getElementById("scoreDisplay").textContent = `Score: ${gameScore}`;
            userSequence = [];
            generateSequence();
          } else {
            Modal.alert("Game Over!");
            resetGame();
          }
        }
      };
      gameArea.appendChild(box);
    }
  }

  generateSequence();
  startGameTimer();
}

// Minigame 4: Reaction Time
function startReactionTime() {
  const gameArea = document.getElementById("gameArea");
  const message = document.createElement("p");
  const button = document.createElement("button");

  message.textContent = "Wait for the signal...";
  button.textContent = "Click Me!";
  button.disabled = true;

  gameArea.appendChild(message);
  gameArea.appendChild(button);

  const delay = Math.random() * 3000 + 2000;
  setTimeout(() => {
    message.textContent = "Click now!";
    button.disabled = false;
    const startTime = Date.now();

    button.onclick = () => {
      const reactionTime = Date.now() - startTime;
      gameScore += Math.max(0, 1000 - reactionTime) / 100;
      document.getElementById("scoreDisplay").textContent = `Score: ${gameScore.toFixed(2)}`;
      startReactionTime();
    };
  }, delay);
}

// Minigame 5: Word Scramble
function startWordScramble() {
  const gameArea = document.getElementById("gameArea");
  const wordDisplay = document.createElement("p");
  const input = document.createElement("input");
  const submit = document.createElement("button");

  input.type = "text";
  submit.textContent = "Submit";

  gameArea.appendChild(wordDisplay);
  gameArea.appendChild(input);
  gameArea.appendChild(submit);

  const words = ["economy", "market", "trade", "tokens", "profit"];
  let currentWord = "";

  function scrambleWord(word) {
    return word.split("").sort(() => Math.random() - 0.5).join("");
  }

  function generateWord() {
    currentWord = words[Math.floor(Math.random() * words.length)];
    wordDisplay.textContent = scrambleWord(currentWord);
    input.value = "";
  }

  submit.onclick = () => {
    if (input.value === currentWord) {
      gameScore++;
      document.getElementById("scoreDisplay").textContent = `Score: ${gameScore}`;
      generateWord();
    }
  };

  generateWord();
  startGameTimer();
}

function startGameTimer() {
  gameInterval = setInterval(() => {
    gameTimeLeft--;
    document.getElementById("timeLeftDisplay").textContent = `Time Left: ${gameTimeLeft}s`;
    if (gameTimeLeft <= 0) {
      clearInterval(gameInterval);
      Modal.alert(`Game Over! Your final score is: ${gameScore}`);
      completeMinigame(gameScore);
    }
  }, 1000);
}

// Event listener for starting the game
document.getElementById("startGameButton").addEventListener("click", startGame);