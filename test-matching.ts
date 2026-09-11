import { calculateMatch, SafeStudentProfile } from "./server/src/services/matching.service";

const fakeStudent: SafeStudentProfile = {
  id: "1", name: "Rahul", usn: "123", branch: "CSE", section: "A", year: "3", semester: 6,
  photo: null, bio: null, favoriteDomain: "AI", linkedin: null, github: null, portfolio: null,
  skills: "Python, React, SQL"
};

console.log(calculateMatch(fakeStudent, "python, react, machine learning"));
console.log(calculateMatch(fakeStudent, "  PYTHON ,   react  ,  Machine Learning,   React "));
console.log(calculateMatch(fakeStudent, ""));

