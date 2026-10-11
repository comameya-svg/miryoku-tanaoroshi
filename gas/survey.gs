// Spiral up!! サミット アンケート
// setup()  : 初回作成（2026-10-09 実行済み）
// update() : 2026-10-11 変更。特典URLの案内をやめ、セッション希望者だけに日程調整ページを表示
// onSubmit : セッション希望者に日程調整URLをメール

const APP_URL = 'https://comameya-svg.github.io/miryoku-tanaoroshi/';
const BOOKING_URL = 'https://yoyaku.comameya.workers.dev/mendan';
const SENDER_NAME = 'じゅんちゃん（横田潤一郎）';
const Q_NAME = 'お名前';
const Q_SESSION = '無料棚卸しセッション（30分・オンライン）を受けてみたいですか？';
const Q_CONSENT = 'ご感想を、サミットや登壇者の紹介に使ってもよいですか？';
const SESSION_YES = ['ぜひ受けたい', '詳しく聞いてから決めたい'];

function update() {
  const form = FormApp.openById(PropertiesService.getScriptProperties().getProperty('FORM_ID'));
  form.setTitle('Spiral up!! サミット アンケート');
  form.setDescription(
    '本日はご参加いただき、ありがとうございました。\n' +
    '3分ほどで終わるアンケートです。今後のサミットづくりの参考にさせていただきます。\n\n' +
    'ご回答内容は、サミットの振り返り、主催者および登壇者からのお知らせ（イベントやサービスのご案内を含む）にのみ利用します。');

  const items = form.getItems();
  const find = (title) => items.filter((it) => it.getTitle() === title)[0];
  const session = find(Q_SESSION);
  const consent = find(Q_CONSENT);

  // 紹介可否の質問を、セッション希望の質問の前へ移す
  if (consent.getIndex() > session.getIndex()) form.moveItem(consent, session.getIndex());

  // セッション希望者だけが進むページ（2回目以降の実行では作り直さない）
  const found = form.getItems(FormApp.ItemType.PAGE_BREAK)[0];
  const page = found ? found.asPageBreakItem() : form.addPageBreakItem();
  page
    .setTitle('無料棚卸しセッションの日程調整')
    .setHelpText(
      'ご希望ありがとうございます！\n' +
      '下のページから、ご都合のよい日時（30分・オンライン）をお選びください。\n' +
      BOOKING_URL + '\n\n' +
      '同じURLを、ご入力のメールアドレスにもお送りします。\n' +
      'このあと「送信」を押して、アンケートを完了してください。');

  const mc = session.asMultipleChoiceItem();
  mc.setChoices([
    mc.createChoice('ぜひ受けたい', page),
    mc.createChoice('詳しく聞いてから決めたい', page),
    mc.createChoice('今回は見送る', FormApp.PageNavigationType.SUBMIT),
  ]);

  form.setConfirmationMessage(
    'ご回答ありがとうございました！\n' +
    'いただいたご感想は、今後のサミットづくりに活かしてまいります。\n' +
    'これからも、あなたの一歩を応援しています。');

  Logger.log('回答用URL: ' + form.getPublishedUrl());
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
  if (SESSION_YES.indexOf(session) < 0) return; // 見送る人にはメールを送らない
  const body =
    (name ? name + ' さま\n\n' : '') +
    'Spiral up!! サミットへのご参加と、アンケートへのご回答ありがとうございました。\n' +
    'じゅんちゃん（横田潤一郎）です。\n\n' +
    '無料棚卸しセッション（30分・オンライン）のご希望、ありがとうございます。\n' +
    '下のページから、ご都合のよい日時をお選びください。\n' +
    BOOKING_URL + '\n\n' +
    'セッションでは、あなたの「魅力」と「課題」を一緒に引き出します。\n' +
    'お会いできるのを楽しみにしています。\n\n' +
    '――――――――――\n' +
    'じゅんちゃん（横田潤一郎）\n' +
    'いい(11)チーム ／ Spiral up!! サミット';
  MailApp.sendEmail({ to: to, subject: '【日程調整】無料棚卸しセッションのご案内｜Spiral up!! サミット', body: body, name: SENDER_NAME });
}
