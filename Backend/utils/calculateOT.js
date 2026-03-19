function calculateOT(checkin, checkout) {

    if(!checkin || !checkout){
        return 0;
    }

    const [h1, m1] = checkin.split(":");
    const [h2, m2] = checkout.split(":");

    const start = parseInt(h1) + parseInt(m1)/60;
    const end = parseInt(h2) + parseInt(m2)/60;

    const work = end - start;

    if(work > 8){
        return work - 8;
    }

    return 0;
}
module.exports = calculateOT;