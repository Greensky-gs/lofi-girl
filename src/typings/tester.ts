export type tester = {
    id: string;
    when: 'songend' | 'onstationinfo' | 'onplayinginfo' | 'oninfo' | 'everytime'
}
export enum TesterButtons {
    SendFeedback = 'tester.send-feedback',
    TesterValidate = 'tester.validate',
    TesterCancel = 'tester.cancel',
    KeywordsButton = 'tester.keywords-button',
    KeyworkdsSelector = 'tester.selector-of-keywords',
    AddComment = 'tester.add-comment',
    EditComment = 'tester.edit.comment',
    RemoveComment = 'tester.remove.comment',
    OwnerValidate = 'owner.test.validate',
    OwnerEditKeywords = 'owner.test.edit.keywords',
    OwnerRefuse = 'owner.test.refuse',
    OwnerEditComment = 'owner.test.edit.comment'
}