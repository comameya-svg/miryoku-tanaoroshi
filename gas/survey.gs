// Spiral up!! サミット アンケート（特典つき）
// 1) setup() を1回だけ実行 → フォーム・回答シート・送信時トリガーを作成
// 2) 回答が送信されると onSubmit() が回答者に特典URLをメールで送る

const APP_URL = 'https://comameya-svg.github.io/miryoku-tanaoroshi/';
const SENDER_NAME = 'じゅんちゃん（横田潤一郎）';
const Q_NAME = 'お名前';
const Q_SESSION = '無料棚卸しセッション（30分・オンライン）を受けてみたいですか？';
const SESSION_YES = ['ぜひ受けたい', '詳しく聞いてから決めたい'];

function setup() {
  const form = FormApp.create('Spiral up!! サミット アンケート（特典つき）');
  form.setDescription(
    '本日はご参加いただき、ありがとうございました。\n' +
    '3分ほどのアンケートにお答えいただいた方全員に、特典「魅力×課題 棚卸しマス」のURLをメールでお届けします。\n\n' +
    'ご回答内容は、サミットの振り返り、特典のお届け、主催者および登壇者からのお知らせ（イベントやサービスのご案内を含む）にのみ利用します。');
  try {
    form.setEmailCollectionType(FormApp.EmailCollectionType.RESPONDER_INPUT);
  } catch (e) {
    form.setCollectEmail(true);
  }

  form.addTextItem().setTitle(Q_NAME).setRequired(true);

  form.addScaleItem().setTitle('サミット全体の満足度を教えてください')
    .setBounds(1, 5).setLabels('いまひとつ', 'とても満足').setRequired(true);

  form.addParagraphTextItem().setTitle('印象に残った言葉や、気づいたことを教えてください');

  const worry = form.addCheckboxItem().setTitle('いま一番近いお悩みはどれですか？（いくつでも）');
  worry.setChoiceValues(['自分の強みがわからない', '想いがうまく言葉にならない', '発信しても伝わらない', '商品やサービスの形にしたい', '仲間とつながりたい'])
    .showOtherOption(true);

  form.addMultipleChoiceItem().setTitle(Q_SESSION)
    .setChoiceValues(['ぜひ受けたい', '詳しく聞いてから決めたい', '今回は見送る']).setRequired(true);

  form.addMultipleChoiceItem().setTitle('ご感想を、サミットや登壇者の紹介に使ってもよいですか？')
    .setChoiceValues(['お名前を出してOK', '匿名ならOK', '使わないでほしい']).setRequired(true);

  form.setConfirmationMessage(
    'ご回答ありがとうございました！\n' +
    '特典「魅力×課題 棚卸しマス」はこちらからどうぞ。\n' + APP_URL + '\n\n' +
    'ご入力のメールアドレスにも、同じURLをお送りしました。');

  const ss = SpreadsheetApp.create('Spiral up!! サミット アンケート 回答');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  ScriptApp.newTrigger('onSubmit').forForm(form).onFormSubmit().create();
  PropertiesService.getScriptProperties().setProperty('FORM_ID', form.getId());

  Logger.log('回答用URL: ' + form.getPublishedUrl());
  Logger.log('編集用URL: ' + form.getEditUrl());
  Logger.log('回答シート: ' + ss.getUrl());
}

function onSubmit(e) {
  const res = e.response;
  const to = res.getRespondentEmail();
  if (!to) return;
  let name = '';
  let session = '';
  res.getItemResponses().forEach(function (r) {
    const t = r.getItem().getTitle();
    if (t === Q_NAME) name = String(r.getResponse());
    if (t === Q_SESSION) session = String(r.getResponse());
  });
  const wantsSession = SESSION_YES.indexOf(session) >= 0;
  const body =
    (name ? name + ' さま\n\n' : '') +
    'Spiral up!! サミットへのご参加と、アンケートへのご回答ありがとうございました。\n' +
    'じゅんちゃん（横田潤一郎）です。\n\n' +
    'お約束の特典「魅力×課題 棚卸しマス」をお届けします。\n' +
    APP_URL + '\n\n' +
    '9つのマスに「魅力」と「課題」を書き出して掛け合わせると、あなたの個性が一文になります。\n' +
    '入力した内容は、お使いのブラウザの中だけに保存されます。\n\n' +
    (wantsSession
      ? '無料棚卸しセッションのご希望もありがとうございます。日程調整のご連絡を、数日以内にこのメールアドレスへお送りします。\n\n'
      : '') +
    'これからも、あなたの一歩を応援しています。\n\n' +
    '――――――――――\n' +
    'じゅんちゃん（横田潤一郎）\n' +
    'いい(11)チーム ／ Spiral up!! サミット';
  MailApp.sendEmail({ to: to, subject: '【特典】魅力×課題 棚卸しマスのご案内｜Spiral up!! サミット', body: body, name: SENDER_NAME });
}
